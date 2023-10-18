/**
 * name : services/userInvite.js
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
const fileService = require('@services/files')
const request = require('request')
const userInviteQueries = require('@database/queries/orgUserInvite')
const fileUploadQueries = require('@database/queries/fileUpload')
const roleQueries = require('@database/queries/userRole')
const notificationTemplateQueries = require('@database/queries/notificationTemplate')
const kafkaCommunication = require('@generics/kafka-communication')
const ProjectRootDir = path.join(__dirname, '../')
const inviteeFileDir = ProjectRootDir + common.tempFolderForBulkUpload
module.exports = class UserInviteHelper {
	static async uploadInvites(data) {
		return new Promise(async (resolve, reject) => {
			try {
				const filePath = data.fileDetails.input_path
				// download file to local directory
				const response = await this.downloadCSV(filePath)
				if (!response.success) {
					throw new Error('FAILED_TO_DOWNLOAD')
				}

				// extract data from csv
				const parsedFileData = await this.extractDataFromCSV(response.result.downloadPath)
				if (!parsedFileData.success || parsedFileData.result.data.length == 0) {
					throw new Error('FAILED_TO_READ_CSV')
				}
				const invitees = parsedFileData.result.data

				// create outPut file and create invites
				const createResponse = await this.createUserInvites(invitees, data.user, data.fileDetails.id)
				const outputFilename = path.basename(createResponse.result.outputFilePath)

				// upload output file to cloud
				const uploadRes = await this.uploadFileToCloud(outputFilename, inviteeFileDir, data.user.id)
				const output_path = uploadRes.result.uploadDest
				const update = {
					output_path,
					updated_by: data.user.id,
					status: createResponse.result.isErrorOccured == true ? common.statusFailed : common.statusProcessed,
				}

				// //update output path in file uploads
				const rowsAffected = await fileUploadQueries.update({ id: data.fileDetails.id }, update)
				if (rowsAffected === 0) {
					throw new Error('FILE_UPLOAD_MODIFY_ERROR')
				}

				// // send email to admin
				if (process.env.ADMIN_INVITEE_UPLOAD_EMAIL_TEMPLATE_CODE) {
					// generate downloadable url
					const inviteeUploadURL = await utils.getDownloadableUrl(output_path)
					await this.sendInviteeEmail(
						process.env.ADMIN_INVITEE_UPLOAD_EMAIL_TEMPLATE_CODE,
						data.user,
						inviteeUploadURL
					)
				}

				// delete the downloaded file and output file
				utils.clearFile(response.result.downloadPath)
				utils.clearFile(createResponse.result.outputFilePath)

				return resolve({
					success: true,
					message: 'CSV_UPLOADED_SUCCESSFULLY',
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
			const downloadableUrl = await utils.getDownloadableUrl(filePath)
			const fileName = path.basename(downloadableUrl)
			const downloadPath = path.join(inviteeFileDir, fileName)

			const response = await axios.get(downloadableUrl, {
				responseType: common.responseType,
			})

			const writeStream = fs.createWriteStream(downloadPath)
			response.data.pipe(writeStream)

			await new Promise((resolve, reject) => {
				writeStream.on('finish', resolve)
				writeStream.on('error', (err) => {
					reject(new Error('FAILED_TO_DOWNLOAD_FILE'))
				})
			})

			return {
				success: true,
				result: {
					destPath: inviteeFileDir,
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

			// get the role data from db
			const allRoles = _.uniq(_.map(csvData, 'roles'))
			const roleList = await roleQueries.findAll({ title: allRoles })
			const roleTitlesToIds = {}
			roleList.forEach((role) => {
				roleTitlesToIds[role.title] = [role.id]
			})

			const input = []
			let isErrorOccured = false

			// process csv data
			for (const invitee of csvData) {
				const inviteeData = {
					...invitee,
					status: common.statusUploaded,
					organization_id: user.organization_id,
					file_id: fileUploadId,
					roles: roleTitlesToIds[invitee.roles] || [],
				}

				const newInvitee = await userInviteQueries.create(inviteeData)

				if (newInvitee.id) {
					const userData = {
						name: invitee.name,
						email: invitee.email,
						role: invitee.roles,
						adminName: user.name,
					}

					if (process.env.INVITEE_EMAIL_TEMPLATE_CODE) {
						await this.sendInviteeEmail(process.env.INVITEE_EMAIL_TEMPLATE_CODE, userData)
					}
				} else {
					isErrorOccured = true
				}

				invitee.statusOrUserId = newInvitee.id || newInvitee
				input.push(invitee)
			}

			const csvContent = utils.generateCSVContent(input)
			const outputFilePath = path.join(inviteeFileDir, outputFileName)

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
			const getSignedUrl = await fileService.getSignedUrl(fileName, userId, dynamicPath)
			if (!getSignedUrl.result) {
				throw new Error('FAILED_TO_GENERATE_SIGNED_URL')
			}

			const fileUploadUrl = getSignedUrl.result.signedUrl
			const filePath = `${folderPath}/${fileName}`
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
		} catch (error) {
			return {
				success: false,
				message: error.message,
			}
		}
	}

	static async sendInviteeEmail(templateCode, userData, inviteeUploadURL = null) {
		try {
			const templateData = await notificationTemplateQueries.findOneEmailTemplate(templateCode)
			if (templateData) {
				const payload = {
					type: common.notificationEmailType,
					email: {
						to: userData.email,
						subject: templateData.subject,
						body: utils.composeEmailBody(templateData.body, {
							name: userData.name,
							role: userData.role || '',
							appName: process.env.APP_NAME,
							adminName: userData.adminName || '',
							inviteeUploadURL,
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
