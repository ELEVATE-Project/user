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
const userQueries = require('@database/queries/users')
const organizationQueries = require('@database/queries/organization')
const notificationTemplateQueries = require('@database/queries/notificationTemplate')
const kafkaCommunication = require('@generics/kafka-communication')
const { eventBroadcaster } = require('@helpers/eventBroadcaster')
const ProjectRootDir = path.join(__dirname, '../')
const inviteeFileDir = ProjectRootDir + common.tempFolderForBulkUpload

const UserCredentialQueries = require('@database/queries/userCredential')
const { Op } = require('sequelize')

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
					status:
						createResponse.result.isErrorOccured == true ? common.FAILED_STATUS : common.PROCESSED_STATUS,
				}

				// //update output path in file uploads
				const rowsAffected = await fileUploadQueries.update({ id: data.fileDetails.id }, update)
				if (rowsAffected === 0) {
					throw new Error('FILE_UPLOAD_MODIFY_ERROR')
				}

				// // send email to admin
				const templateCode = process.env.ADMIN_INVITEE_UPLOAD_EMAIL_TEMPLATE_CODE
				if (templateCode) {
					const templateData = await notificationTemplateQueries.findOneEmailTemplate(
						templateCode,
						data.user.organization_id
					)

					if (templateData) {
						const inviteeUploadURL = await utils.getDownloadableUrl(output_path)
						await this.sendInviteeEmail(templateData, data.user, inviteeUploadURL)
					}
				}

				// delete the downloaded file and output file.
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
			const allRoles = _.uniq(_.map(csvData, 'roles').map((role) => role.toLowerCase()))

			const roleList = await roleQueries.findAll({ title: allRoles })
			const roleTitlesToIds = {}
			roleList.forEach((role) => {
				roleTitlesToIds[role.title] = [role.id]
			})

			//get all existing user
			const emailArray = _.uniq(_.map(csvData, 'email'))

			const userCredentials = await UserCredentialQueries.findAll(
				{ email: { [Op.in]: emailArray } },
				{
					attributes: ['user_id'],
				}
			)
			const userIds = _.map(userCredentials, 'user_id')

			const existingUsers = await userQueries.findAll(
				{ id: userIds },
				{
					attributes: ['id', 'email', 'organization_id', 'roles'],
				}
			)

			const existingEmailsMap = new Map(existingUsers.map((eachUser) => [eachUser.email, eachUser]))

			//find default org id
			const defaultOrg = await organizationQueries.findOne({ code: process.env.DEFAULT_ORGANISATION_CODE })
			const defaultOrgId = defaultOrg?.id || null

			const input = []
			let isErrorOccured = false

			//fetch email template
			const mentorTemplateCode = process.env.MENTOR_INVITATION_EMAIL_TEMPLATE_CODE || null
			const menteeTemplateCode = process.env.MENTEE_INVITATION_EMAIL_TEMPLATE_CODE || null

			const [mentorTemplateData, menteeTemplateData] = await Promise.all([
				mentorTemplateCode
					? notificationTemplateQueries.findOneEmailTemplate(mentorTemplateCode, user.organization_id)
					: null,
				menteeTemplateCode
					? notificationTemplateQueries.findOneEmailTemplate(menteeTemplateCode, user.organization_id)
					: null,
			])

			const templates = {
				[common.MENTOR_ROLE]: mentorTemplateData,
				[common.MENTEE_ROLE]: menteeTemplateData,
			}

			// process csv data
			for (const invitee of csvData) {
				//convert the fields to lower case
				invitee.roles = invitee.roles.toLowerCase()
				invitee.email = invitee.email.toLowerCase()

				//validate the fields
				if (!utils.isValidEmail(invitee.email)) {
					invitee.statusOrUserId = 'EMAIL_INVALID'
					input.push(invitee)
					continue
				}

				if (!roleTitlesToIds.hasOwnProperty(invitee.roles)) {
					invitee.statusOrUserId = 'ROLE_INVALID'
					input.push(invitee)
					continue
				}

				//update user details if the user exist and in default org
				const existingUser = existingEmailsMap.get(invitee.email)
				if (existingUser) {
					invitee.statusOrUserId = 'USER_ALREADY_EXISTS'
					isErrorOccured = true

					const isOrganizationMatch =
						existingUser.organization_id === defaultOrgId ||
						existingUser.organization_id === user.organization_id
					if (isOrganizationMatch) {
						let userUpdateData = {}
						if (existingUser.organization_id != user.organization_id) {
							userUpdateData.organization_id = user.organization_id
							userUpdateData.refresh_tokens = []
						}
						const areAllElementsInArray = _.every(roleTitlesToIds[invitee.roles], (element) =>
							_.includes(existingUser.roles, element)
						)
						if (!areAllElementsInArray) {
							userUpdateData.roles = roleTitlesToIds[invitee.roles]
							userUpdateData.refresh_tokens = []
						}

						if (userUpdateData.organization_id || userUpdateData.roles) {
							const userCredentials = await UserCredentialQueries.findOne({
								email: invitee.email.toLowerCase(),
							})

							await userQueries.updateUser({ id: userCredentials.user_id }, userUpdateData)

							await UserCredentialQueries.updateUser(
								{
									email: invitee.email.toLowerCase(),
								},
								{ organization_id: userUpdateData.organization_id }
							)
							const userRoles = await roleQueries.findAll({ id: existingUser.roles })
							//call event to update in mentoring
							if (!userUpdateData?.roles) {
								eventBroadcaster('updateOrganization', {
									requestBody: {
										user_id: existingUser.id,
										organization_id: existingUser.organization_id,
										roles: _.map(userRoles, 'title'),
									},
								})
							} else {
								let requestBody = {
									user_id: existingUser.id,
									new_roles: [invitee.roles],
									current_roles: _.map(userRoles, 'title'),
								}
								if (userUpdateData.organization_id) requestBody.organization_id = user.organization_id
								eventBroadcaster('roleChange', {
									requestBody,
								})

								//delete from cache
								const redisUserKey = common.redisUserPrefix + existingUser.id.toString()
								await utils.redisDel(redisUserKey)
							}
						}
					}
				} else {
					const inviteeData = {
						...invitee,
						status: common.UPLOADED_STATUS,
						organization_id: user.organization_id,
						file_id: fileUploadId,
						roles: roleTitlesToIds[invitee.roles] || [],
					}

					const newInvitee = await userInviteQueries.create(inviteeData)
					const newUserCred = await UserCredentialQueries.create({
						email: newInvitee.email,
						organization_id: newInvitee.organization_id,
						organization_user_invite_id: newInvitee.id,
					})
					if (newUserCred.id) {
						const { name, email, roles } = invitee
						const userData = {
							name,
							email,
							role: roles,
							org_name: user.org_name,
						}

						const templateData = templates[roles]
						//send email invitation for user
						if (templateData && Object.keys(templateData).length > 0) {
							await this.sendInviteeEmail(templateData, userData)
						}
					} else {
						isErrorOccured = true
						await userInviteQueries.deleteOne(newInvitee.id)
					}

					invitee.statusOrUserId = newInvitee.id || newInvitee
				}

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

	static async sendInviteeEmail(templateData, userData, inviteeUploadURL = null) {
		try {
			const payload = {
				type: common.notificationEmailType,
				email: {
					to: userData.email,
					subject: templateData.subject,
					body: utils.composeEmailBody(templateData.body, {
						name: userData.name,
						role: userData.role || '',
						orgName: userData.org_name || '',
						appName: process.env.APP_NAME,
						inviteeUploadURL,
						portalURL: process.env.PORTAL_URL,
					}),
				},
			}

			await kafkaCommunication.pushEmailToKafka(payload)

			return {
				success: true,
			}
		} catch (error) {
			throw error
		}
	}
}
