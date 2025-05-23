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
const roleQueries = require('@database/queries/user-role')
const userQueries = require('@database/queries/users')
const organizationQueries = require('@database/queries/organization')
const notificationTemplateQueries = require('@database/queries/notificationTemplate')
const kafkaCommunication = require('@generics/kafka-communication')
const { eventBroadcaster } = require('@helpers/eventBroadcaster')
const ProjectRootDir = path.join(__dirname, '../')
const inviteeFileDir = ProjectRootDir + common.tempFolderForBulkUpload

const UserCredentialQueries = require('@database/queries/userCredential')
const { Op } = require('sequelize')
const emailEncryption = require('@utils/emailEncryption')

module.exports = class UserInviteHelper {
	static async uploadInvites(data) {
		return new Promise(async (resolve, reject) => {
			try {
				const filePath = data.fileDetails.input_path
				// download file to local directory
				const response = await this.downloadCSV(filePath)
				if (!response.success) throw new Error('FAILED_TO_DOWNLOAD')

				// extract data from csv
				const parsedFileData = await this.extractDataFromCSV(response.result.downloadPath)
				if (!parsedFileData.success) throw new Error('FAILED_TO_READ_CSV')
				const invitees = parsedFileData.result.data

				// create outPut file and create invites
				const createResponse = await this.createUserInvites(invitees, data.user, data.fileDetails.id)
				const outputFilename = path.basename(createResponse.result.outputFilePath)

				// upload output file to cloud
				const uploadRes = await this.uploadFileToCloud(
					outputFilename,
					inviteeFileDir,
					data.user.id,
					'userInviteStatusCSV/' + data.user.organization_id
				)

				const output_path = uploadRes.result.uploadDest
				const update = {
					output_path,
					updated_by: data.user.id,
					status:
						createResponse.result.isErrorOccured == true ? common.FAILED_STATUS : common.PROCESSED_STATUS,
				}

				//update output path in file uploads
				const rowsAffected = await fileUploadQueries.update(
					{ id: data.fileDetails.id, organization_id: data.user.organization_id },
					update
				)
				if (rowsAffected === 0) {
					throw new Error('FILE_UPLOAD_MODIFY_ERROR')
				}

				// send email to admin
				const templateCode = process.env.ADMIN_INVITEE_UPLOAD_EMAIL_TEMPLATE_CODE
				if (templateCode) {
					const templateData = await notificationTemplateQueries.findOneEmailTemplate(
						templateCode,
						data.user.organization_id
					)

					if (templateData) {
						const inviteeUploadURL = await utils.getDownloadableUrl(output_path)
						await this.sendInviteeEmail(templateData, data.user, inviteeUploadURL) //Rename this to function to generic name since this function is used for both Invitee & Org-admin.
					}
				}

				// delete the downloaded file and output file.
				//utils.clearFile(response.result.downloadPath)
				//utils.clearFile(createResponse.result.outputFilePath)

				return resolve({
					success: true,
					message: 'CSV_UPLOADED_SUCCESSFULLY',
				})
			} catch (error) {
				console.log(error, 'CSV PROCESSING ERROR')
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
			let fileName = path.basename(downloadableUrl)

			// Find the index of the first occurrence of '?'
			const index = fileName.indexOf('?')
			// Extract the portion of the string before the '?' if it exists, otherwise use the entire string
			fileName = index !== -1 ? fileName.substring(0, index) : fileName

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
			const parsedCSVData = []
			const csvToJsonData = await csv().fromFile(csvFilePath)
			if (csvToJsonData.length > 0) {
				const header = Object.keys(csvToJsonData[0])
				const isRoleExist = header.map((column) => column.toLowerCase()).includes('roles')
				csvToJsonData.forEach((row) => {
					if (row.name || row.email || row.roles) {
						if (isRoleExist) {
							const roles = row.roles.replace(/"/g, '').split(',')
							row.roles = roles.map((role) => role.trim()) // Trim each role
						}

						// Extract and prepare meta fields
						const metaFields = {
							block: row.block?.trim() || null,
							state: row.state?.trim() || null,
							school: row.school?.trim() || null,
							cluster: row.cluster?.trim() || null,
							district: row.district?.trim() || null,
						}

						// Add meta fields to row object
						row.meta = metaFields

						// Handle password field if exists
						if (row.password) {
							row.password = row.password.trim()
						}
						parsedCSVData.push(row)
					}
				})
			}

			return {
				success: true,
				result: {
					data: parsedCSVData,
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
			let menteeRoleId, mentorRoleId

			//get all the roles and map title and id
			const roleList = await roleQueries.findAll({
				user_type: common.ROLE_TYPE_NON_SYSTEM,
				status: common.ACTIVE_STATUS,
			})
			const roleTitlesToIds = {}
			roleList.forEach((role) => {
				roleTitlesToIds[role.title] = [role.id]
				if (role.title === common.MENTEE_ROLE) {
					menteeRoleId = role.id
				}
				if (role.title === common.MENTOR_ROLE) {
					mentorRoleId = role.id
				}
			})

			//get all existing user
			const emailArray = _.uniq(_.map(csvData, 'email')).map((email) =>
				emailEncryption.encrypt(email.trim().toLowerCase())
			)

			const userCredentials = await UserCredentialQueries.findAll(
				{ email: { [Op.in]: emailArray } },
				{
					attributes: ['user_id', 'email'],
				}
			)

			//This is valid since UserCredentials Already Store The Encrypted Email ID
			const userIds = _.map(userCredentials, 'user_id')
			const existingUsers = await userQueries.findAll(
				{ id: userIds },
				{
					attributes: ['id', 'email', 'organization_id', 'roles', 'meta'],
				}
			)

			//Get All The Users From Database based on UserIds From UserCredentials
			const existingEmailsMap = new Map(existingUsers.map((eachUser) => [eachUser.email, eachUser])) //Figure Out Who Are The Existing Users

			//find default org id
			const defaultOrg = await organizationQueries.findOne({ code: process.env.DEFAULT_ORGANISATION_CODE })
			const defaultOrgId = defaultOrg?.id || null

			let input = []
			let isErrorOccured = false
			let isOrgUpdate = false

			//fetch generic email template
			const emailTemplate = await notificationTemplateQueries.findOneEmailTemplate(
				process.env.GENERIC_INVITATION_EMAIL_TEMPLATE_CODE,
				user.organization_id
			)

			//find already invited users
			const emailList = await userInviteQueries.findAll({ email: emailArray })
			const existingInvitees = {}
			emailList.forEach((userInvitee) => {
				existingInvitees[userInvitee.email] = [userInvitee.id]
			})
			console.log(existingInvitees)
			// process csv data
			for (const invitee of csvData) {
				invitee.email = invitee.email.trim().toLowerCase()
				invitee.roles = invitee.roles.map((role) => role.trim())
				const encryptedEmail = emailEncryption.encrypt(invitee.email.toLowerCase())
				const hashedPassword = utils.hashPassword(invitee.password)

				//find the invalid fields and generate error message
				let invalidFields = []
				if (!utils.isValidName(invitee.name)) {
					invalidFields.push('name')
				}

				if (!utils.isValidEmail(invitee.email)) {
					invalidFields.push('email')
				}
				if (!utils.isValidPassword(invitee.password)) {
					invalidFields.push('password')
				}

				const invalidRoles = invitee.roles.filter((role) => !roleTitlesToIds.hasOwnProperty(role.toLowerCase()))
				if (invalidRoles.length > 0) {
					invalidFields.push('roles')
				}

				//merge all error message
				if (invalidFields.length > 0) {
					const errorMessage = `${
						invalidFields.length > 2
							? invalidFields.slice(0, -1).join(', ') + ', and ' + invalidFields.slice(-1)
							: invalidFields.join(' and ')
					} ${invalidFields.length > 1 ? 'are' : 'is'} invalid.`

					invitee.statusOrUserId = errorMessage
					invitee.roles = invitee.roles.length > 0 ? invitee.roles.join(',') : ''
					input.push(invitee)
					continue
				}

				const existingUser = existingEmailsMap.get(encryptedEmail)
				//return error for already invited user
				if (!existingUser && existingInvitees.hasOwnProperty(encryptedEmail)) {
					console.log('aaaaa')
					invitee.statusOrUserId = 'User already exist'
					invitee.roles = invitee.roles.length > 0 ? invitee.roles.join(',') : ''
					input.push(invitee)
					continue
				}

				// Update user details if the user exists and belongs to the default organization
				if (existingUser) {
					invitee.statusOrUserId = 'User already exist'
					isErrorOccured = true

					const isOrganizationMatch =
						existingUser.organization_id === defaultOrgId ||
						existingUser.organization_id === user.organization_id

					if (isOrganizationMatch) {
						let userUpdateData = {}

						//update user organization
						if (existingUser.organization_id != user.organization_id) {
							await userQueries.changeOrganization(
								existingUser.id,
								existingUser.organization_id,
								user.organization_id,
								{
									organization_id: user.organization_id,
								}
							)

							isOrgUpdate = true
							userUpdateData.refresh_tokens = []
						}

						//find the new roles
						const elementsNotInArray = _.difference(
							_.map(invitee.roles, (role) => roleTitlesToIds[role.toLowerCase()]).flat(),
							existingUser.roles
						)

						//update the user roles and handle downgrade of role
						if (elementsNotInArray.length > 0) {
							userUpdateData.roles = []
							if (existingUser.roles.includes(menteeRoleId)) {
								if (existingUser.roles.length === 1) {
									userUpdateData.roles.push(...elementsNotInArray, menteeRoleId)
								} else {
									userUpdateData.roles.push(...elementsNotInArray, ...existingUser.roles)
								}
							} else {
								userUpdateData.roles.push(...elementsNotInArray, ...existingUser.roles)
							}

							if (userUpdateData.roles.includes(mentorRoleId)) {
								userUpdateData.roles = _.pull(userUpdateData.roles, menteeRoleId)
							}

							userUpdateData.refresh_tokens = []
						}

						// Update user meta data if any meta field is provided
						if (invitee.meta && Object.values(invitee.meta).some((value) => value !== null)) {
							// Create a copy of existing meta or initialize an empty object
							const currentMeta = existingUser.meta || {}

							// Update only the fields that are provided in the invitee meta
							const updatedMeta = { ...currentMeta }
							for (const [key, value] of Object.entries(invitee.meta)) {
								if (value !== null) {
									updatedMeta[key] = value
								}
							}

							// Add the updated meta to userUpdateData
							userUpdateData.meta = updatedMeta
						}

						// Update password if provided
						if (invitee.password) {
							// Add flag to include password update in UserCredential
							userUpdateData.password_update = true
						}

						//update user and user credentials table with new role organization
						if (isOrgUpdate || userUpdateData.roles || userUpdateData.meta || invitee.password) {
							const userCred = await UserCredentialQueries.findOne({
								email: encryptedEmail,
							})

							await userQueries.updateUser({ id: userCred.user_id }, userUpdateData)

							// Update UserCredential with organization_id and potentially password
							const credentialUpdateData = { organization_id: user.organization_id }

							// Add password to update data if provided
							if (invitee.password) {
								// Assuming you have a password hashing utility
								// You might need to adjust this based on your password handling
								credentialUpdateData.password = invitee.password // Consider hashing
							}

							await UserCredentialQueries.updateUser(
								{
									email: encryptedEmail,
								},
								credentialUpdateData
							)

							const currentRoles = utils.getRoleTitlesFromId(existingUser.roles, roleList)
							let newRoles = []
							if (userUpdateData.roles) {
								newRoles = utils.getRoleTitlesFromId(
									_.difference(userUpdateData.roles, existingUser.roles),
									roleList
								)
								//remove session_manager role because the mentee role is enough to change role in mentoring side
								newRoles = newRoles.filter((role) => role !== common.SESSION_MANAGER_ROLE)
							}

							//call event to update organization in mentoring
							if (isOrgUpdate) {
								eventBroadcaster('updateOrganization', {
									requestBody: {
										user_id: existingUser.id,
										organization_id: user.organization_id,
										roles: currentRoles,
									},
								})
							}

							if (newRoles.length > 0) {
								//call event to update role and organization in mentoring
								let requestBody = {
									user_id: existingUser.id,
									new_roles: newRoles,
									current_roles: currentRoles,
								}
								if (isOrgUpdate) requestBody.organization_id = user.organization_id
								eventBroadcaster('roleChange', {
									requestBody,
								})
							}

							//remove user data from redis
							const redisUserKey = common.redisUserPrefix + existingUser.id.toString()
							await utils.redisDel(redisUserKey)
							invitee.statusOrUserId = 'Success'
						} else {
							invitee.statusOrUserId = 'No updates needed. User details are already up to date'
						}
					} else {
						//user doesn't have access to update user data
						invitee.statusOrUserId = 'Unauthorised to bulk upload user from another organisation'
					}
				} else {
					//new user invitee creation
					const inviteeData = {
						...invitee,
						status: common.UPLOADED_STATUS,
						organization_id: user.organization_id,
						file_id: fileUploadId,
						roles: (invitee.roles || []).map((roleTitle) => roleTitlesToIds[roleTitle.toLowerCase()] || []),
						email: encryptedEmail,
						meta: invitee.meta || {},
					}

					inviteeData.email = encryptedEmail
					const newInvitee = await userInviteQueries.create(inviteeData)

					if (newInvitee?.id) {
						invitee.statusOrUserId = newInvitee.id
						const insertedUser = await userQueries.create({
							name: inviteeData.name,
							email: inviteeData.email,
							roles: newInvitee.roles,
							password: hashedPassword,
							meta: inviteeData.meta,
							organization_id: inviteeData.organization_id,
						})
						//create user credentials entry
						const credentialData = {
							email: newInvitee.email,
							organization_id: newInvitee.organization_id,
							organization_user_invite_id: newInvitee.id,
							user_id: insertedUser.id,
						}

						// Add password if provided
						if (invitee.password) {
							credentialData.password = hashedPassword
						}

						const newUserCred = await UserCredentialQueries.create(credentialData)

						if (newUserCred?.id) {
							const { name, email } = invitee
							const roles = utils.getRoleTitlesFromId(newInvitee.roles, roleList)
							const roleToString =
								roles.length > 0
									? roles
											.map((role) =>
												role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
											)
											.join(' and ')
									: ''

							const userData = {
								name,
								email,
								roles: roleToString,
								org_name: user.org_name,
							}

							//send email invitation for new user
							if (emailTemplate) {
								await this.sendInviteeEmail(emailTemplate, userData, null, { roles: roleToString })
							}
						} else {
							//delete invitation entry
							isErrorOccured = true
							await userInviteQueries.deleteOne(newInvitee.id)
							invitee.statusOrUserId = newUserCred
						}
					} else {
						isErrorOccured = true
						invitee.statusOrUserId = newInvitee
					}
				}

				//convert roles array to string
				invitee.roles = invitee.roles.length > 0 ? invitee.roles.join(',') : ''
				input.push(invitee)
			}

			//generate output csv
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
			const getSignedUrl = await fileService.getSignedUrl(fileName, userId, dynamicPath, false)
			if (!getSignedUrl.result) {
				throw new Error('FAILED_TO_GENERATE_SIGNED_URL')
			}

			const fileUploadUrl = getSignedUrl.result.signedUrl
			const filePath = `${folderPath}/${fileName}`
			const fileData = fs.readFileSync(filePath, 'utf-8')

			const result = await new Promise((resolve, reject) => {
				try {
					request(
						{
							url: fileUploadUrl,
							method: 'put',
							headers: {
								'x-ms-blob-type': common.azureBlobType,
								'Content-Type': 'multipart/form-data',
							},
							body: fileData,
						},
						(error, response, body) => {
							if (error) reject(error)
							else resolve(response.statusCode)
						}
					)
				} catch (error) {
					reject(error)
				}
			})

			return {
				success: true,
				result: {
					uploadDest: getSignedUrl.result.filePath,
				},
			}
		} catch (error) {
			return {
				success: false,
				message: error.message,
			}
		}
	}

	static async sendInviteeEmail(templateData, userData, inviteeUploadURL = null, subjectComposeData = {}) {
		try {
			const payload = {
				type: common.notificationEmailType,
				email: {
					to: userData.email,
					subject:
						subjectComposeData && Object.keys(subjectComposeData).length > 0
							? utils.composeEmailBody(templateData.subject, subjectComposeData)
							: templateData.subject,
					body: utils.composeEmailBody(templateData.body, {
						name: userData.name,
						role: userData.role || '',
						orgName: userData.org_name || '',
						appName: process.env.APP_NAME,
						portalURL: process.env.PORTAL_URL,
						roles: userData.roles || '',
					}),
				},
			}
			if (inviteeUploadURL != null) {
				const currentDate = new Date().toISOString().split('T')[0].replace(/-/g, '')

				payload.email.attachments = [
					{
						url: inviteeUploadURL,
						filename: `user-invite-status_${currentDate}.csv`,
						type: 'text/csv',
					},
				]
			}

			await kafkaCommunication.pushEmailToKafka(payload)
			return {
				success: true,
			}
		} catch (error) {
			console.log(error)
			throw error
		}
	}
}
