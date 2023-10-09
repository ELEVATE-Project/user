/**
 * name : services/helper/userInvite.js
 * author : Priyanka Pradeep
 * created-date : 27-Sep-2023
 * Description : User Invite Service Helper.
 */

// Dependencies
const _ = require('lodash')
const utils = require('@generics/utils')
const fs = require('fs')
const path = require('path')
const csv = require('csvtojson')
const axios = require('axios')
const common = require('@constants/common')
const filesHelper = require('@services/helper/files')
const request = require('request')
const userInviteQueries = require('@database/queries/orgUserInvite')
const fileUploadQueries = require('@database/queries/fileUpload')
const roleQueries = require('@database/queries/userRole')
const notificationTemplateQueries = require('@database/queries/notificationTemplate')
const kafkaCommunication = require('@generics/kafka-communication')

module.exports = class UserInviteHelper {
	static async uploadInvites(data) {
		return new Promise(async (resolve, reject) => {
			try {
				const filePath = data.fileDetails.input_path

				//download file to local directory
				let response = await this.downloadCSV(filePath)
				if (!response.success) {
					throw new Error('Failed to download file')
				}
				const folderPath = response.result.destPath

				//extract data from csv
				let parsedFileData = await this.extractDataFromCSV(response.result.downloadPath)
				if (parsedFileData.result.data.length == 0) {
					throw new Error('Failed to read csv data')
				}
				const invites = parsedFileData.result.data

				//create outPut file and create invites
				const createResponse = await this.createUserInvites(invites, data.user, data.fileDetails.id)
				let outputFilename = path.basename(createResponse.result.outputFilePath)

				//upload output file to cloud
				const uploadRes = await this.uploadFileToCloud(outputFilename, folderPath, data.user.id)
				let update = {
					output_path: uploadRes.result.uploadDest,
					updated_by: data.user.id,
					status: createResponse.result.isErrorOccured == true ? common.statusFailed : common.statusProcessed,
				}

				//update output path in file uploads
				const rowsAffected = await fileUploadQueries.update({ id: data.fileDetails.id }, update)
				if (rowsAffected == 0) {
					throw new Error('FILE_UPLOAD_MODIFY_ERROR')
				}
				//send email to admin
				await this.sendInviteeEmail(process.env.ADMIN_INVITEE_UPLOAD_EMAIL_TEMPLATE_CODE, data.user)

				//delete the downloaded file and output file
				utils.clearFile(response.result.downloadPath)
				utils.clearFile(createResponse.result.outputFilePath)

				return resolve({
					success: true,
				})
			} catch (error) {
				return reject({
					success: false,
					message: error.message,
				})
			}
		})
	}

	static async downloadCSV(filePath) {
		try {
			const destPath = PROJECT_ROOT_DIRECTORY + common.tempFolderForBulkUpload
			const downloadableUrl = await utils.getDownloadableUrl(filePath)
			const fileName = path.basename(downloadableUrl)
			const downloadPath = path.join(destPath, fileName)

			const response = await axios.get(downloadableUrl, {
				responseType: common.responseType,
			})

			const writeStream = fs.createWriteStream(downloadPath)
			response.data.pipe(writeStream)

			writeStream.on('error', (error) => {
				throw new Error('Failed to write the downloaded file')
			})

			return {
				success: true,
				result: {
					destPath,
					fileName,
					downloadPath,
				},
			}
		} catch (error) {
			return {
				success: false,
				message: error.message,
			}
		}
	}

	static async extractDataFromCSV(csvFilePath) {
		try {
			const csvToJsonData = await csv().fromFile(csvFilePath)
			return {
				success: true,
				result: {
					data: csvToJsonData,
				},
			}
		} catch (error) {
			return {
				success: false,
				message: error.message,
			}
		}
	}

	static async createUserInvites(csvData, user, fileUploadId) {
		try {
			const outputFileName = utils.generateFileName(common.inviteeOutputFile, common.csvExtension)

			let input = []
			let isErrorOccured = false

			for (const invitee of csvData) {
				let inviteeData = Object.assign({}, invitee)
				inviteeData.status = common.statusUploaded
				inviteeData.organization_id = user.organization_id
				inviteeData.file_id = fileUploadId
				const roles = await roleQueries.findAll({ title: [inviteeData.roles] })
				if (roles && roles.length > 0) {
					inviteeData.roles = _.map(roles, 'id')
				}

				const data = await userInviteQueries.create(inviteeData)
				let status
				if (data.id) {
					status = data.id
					data.user = user
					data.role = invitee.roles
					await this.sendInviteeEmail(process.env.INVITEE_EMAIL_TEMPLATE_CODE, data)
				} else {
					status = data
					isErrorOccured = true
				}
				invitee.status = data.id || data
				isErrorOccured = !data.id
				console.log(invitee, isErrorOccured, 'invitee')
				input.push(invitee)
			}

			const headers = Object.keys(input[0])
			const csvContent = [
				headers.join(','),
				...input.map((row) => headers.map((fieldName) => JSON.stringify(row[fieldName])).join(',')),
			].join('\n')

			const destPath = PROJECT_ROOT_DIRECTORY + common.tempFolderForBulkUpload
			const outputFilePath = path.join(destPath, outputFileName)
			fs.writeFileSync(outputFilePath, csvContent)

			return {
				success: true,
				result: {
					outputFilePath,
					isErrorOccured,
				},
			}
		} catch (error) {
			return {
				success: false,
				message: error,
			}
		}
	}

	static async uploadFileToCloud(fileName, folderPath, userId = '', dynamicPath = '') {
		try {
			const getSignedUrl = await filesHelper.getSignedUrl(fileName, userId, dynamicPath)
			if (getSignedUrl.result && Object.keys(getSignedUrl.result).length > 0) {
				const fileUploadUrl = getSignedUrl.result.signedUrl

				const filePath = folderPath + '/' + fileName
				const fileData = fs.readFileSync(filePath, 'utf-8')

				await request({
					url: fileUploadUrl,
					method: 'put',
					headers: {
						'x-ms-blob-type': common.azureBlobType,
						'Content-Type': 'multipart/form-data',
					},
					body: fileData,
				})

				return {
					success: true,
					result: {
						uploadDest: getSignedUrl.result.destFilePath,
					},
				}
			} else {
				throw new Error('Failed to generate signed URL')
			}
		} catch (error) {
			return {
				success: false,
				message: error.message,
			}
		}
	}

	static async sendInviteeEmail(templateCode, userData) {
		try {
			const templateData = await notificationTemplateQueries.findOneEmailTemplate(templateCode)

			if (templateData) {
				// Push successfull invite email to kafka
				const payload = {
					type: common.notificationEmailType,
					email: {
						to: userData.email,
						subject: templateData.subject,
						body: utils.composeEmailBody(templateData.body, {
							name: userData.name,
							role: userData.roles ?? '',
							appName: process.env.APP_NAME,
							adminName: userData.user?.name ?? '',
						}),
					},
				}

				await kafkaCommunication.pushEmailToKafka(payload)
			}

			return {
				success: true,
			}
		} catch (error) {
			throw error
		}
	}
}
