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
const entityTypeQueries = require('@database/queries/entityType')
const UserCredentialQueries = require('@database/queries/userCredential')
const { Op } = require('sequelize')
const emailEncryption = require('@utils/emailEncryption')
const userOrganizationQueries = require('@database/queries/userOrganization')
const userOrganizationRoleQueries = require('@database/queries/userOrganizationRole')
const { eventBodyDTO, keysFilter } = require('@dtos/userDTO')
const { broadcastUserEvent } = require('@helpers/eventBroadcasterMain')
const { generateUniqueUsername, generateUniqueCodeString } = require('@utils/usernameGenerator.js')
const userRolesQueries = require('@database/queries/userOrganizationRole')
const invitationQueries = require('@database/queries/invitation')
const notificationUtils = require('@utils/notification')
const tenantDomainQueries = require('@database/queries/tenantDomain')
const tenantQueries = require('@database/queries/tenants')
let defaultOrg = {}
let modelName = ''
let externalEntityNameIdMap = {}
let emailAndPhoneMissing = false
let loginUrl = ''

module.exports = class UserInviteHelper {
	static async uploadInvites(data) {
		return new Promise(async (resolve, reject) => {
			try {
				const filePath = data.fileDetails.input_path
				const uploadType = data.user.uploadType
				// download file to local directory
				const response = await this.downloadCSV(filePath)
				if (!response.success) {
					await this.sendErrorEmail(data.user, `Failed to download the input CSV.`)
					throw new Error('FAILED_TO_DOWNLOAD')
				}

				// extract data from csv
				const parsedFileData = await this.extractDataFromCSV(response.result.downloadPath, data.user)
				if (!parsedFileData.success) {
					await this.sendErrorEmail(
						data.user,
						parsedFileData?.error || `Failed to parse the input CSV. Please recheck the data-file.`
					)
					throw new Error('FAILED_TO_READ_CSV')
				}
				const invitees = parsedFileData.result.data
				const additionalCsvHeaders = parsedFileData.result.additionalCsvHeaders
				const editable_fields = data?.user?.editableFields || []
				const tenantDetails = await tenantQueries.findOne(
					{
						code: data.user.tenant_code,
					},
					{
						attributes: ['meta'],
					}
				)
				const validity = tenantDetails?.meta?.bulk_invitation_validity || common.BULK_INVITATION_VALIDITY
				const now = new Date()
				const valid_till = new Date(now.getTime() + Number(validity))

				const invitation = await invitationQueries.create({
					file_id: data.fileDetails.id,
					editable_fields,
					valid_till,
					created_by: data.user.id,
					organization_id: data.user.organization_id,
					tenant_code: data.user.tenant_code,
				})

				// create outPut file and create invites
				const createResponse = await this.createUserInvites(
					invitees,
					data.user,
					data.fileDetails.id,
					additionalCsvHeaders,
					invitation?.id,
					tenantDetails?.meta,
					uploadType
				)
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

				const inviteeUploadURL = await utils.getDownloadableUrl(output_path)
				if (inviteeUploadURL) await this.sendInviteeEmail(data.user, inviteeUploadURL)

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
	static async extractDataFromCSV(csvFilePath, userData) {
		try {
			const parsedCSVData = []
			const csvToJsonData = await csv().fromFile(csvFilePath)

			if (csvToJsonData.length === 0) {
				return {
					success: true,
					result: {
						data: parsedCSVData,
					},
				}
			}

			// Fetch default organization and validation data
			defaultOrg = await organizationQueries.findOne(
				{ code: process.env.DEFAULT_ORGANISATION_CODE, tenant_code: userData.tenant_code },
				{ attributes: ['id'] }
			)
			modelName = await userQueries.getModelName()
			const validationData = await entityTypeQueries.findUserEntityTypesAndEntities({
				status: 'ACTIVE',
				organization_id: {
					[Op.in]: [userData.organization_id, defaultOrg.id],
				},
				tenant_code: userData.tenant_code,
				model_names: { [Op.contains]: [modelName] },
			})
			const prunedEntities = utils.removeDefaultOrgEntityTypes(validationData, userData.organization_id)
			const externalEntityTypes = prunedEntities
				.filter((entity) => entity.external_entity_type === true)
				.map((entity) => entity.value)
			// Function to get unique values for externalEntityTypes keys
			let service = ''
			let endPoint = ''
			const getUniqueEntityValues = (data, entityTypes) => {
				const uniqueValues = new Set()

				data.forEach((item) => {
					entityTypes.forEach((key) => {
						if (item[key]) {
							const findEntityType = prunedEntities.find((prunedEntity) => prunedEntity.value == key)
							service = findEntityType.meta.service
							endPoint = findEntityType.meta.endPoint
							if (findEntityType.data_type === 'ARRAY') {
								// Split comma-separated values and add each as a unique value
								item[key].split(',').forEach((subrole) => uniqueValues.add(subrole.trim()))
							} else {
								// Add single value
								uniqueValues.add(item[key])
							}
						}
					})
				})

				return Array.from(uniqueValues)
			}
			// Get unique values
			const uniqueEntityValues = getUniqueEntityValues(csvToJsonData, externalEntityTypes)
			externalEntityNameIdMap = await utils.fetchAndMapAllExternalEntities(
				uniqueEntityValues,
				service,
				endPoint,
				userData.tenant_code
			)
			// Check if 'roles' column exists
			const header = Object.keys(csvToJsonData[0])
			const userTableFields = await userQueries.getColumns()
			const entityFields = validationData.map((key) => key.value)
			const additionalCsvHeaders = keysFilter(_.difference(header, [...userTableFields, ...entityFields]))
			const isRoleExist = header.some((column) => column.toLowerCase() === 'roles')

			// Process rows concurrently
			await Promise.all(
				csvToJsonData.map(async (row) => {
					if (!row.name && !row.email && !row.roles) {
						return // Skip rows without name, email, or roles
					}

					// Process roles if the column exists
					if (isRoleExist && row.roles) {
						row.roles = row.roles
							.replace(/"/g, '')
							.split(',')
							.map((role) => role.trim())
					}
					row.username = row?.username ? row.username.toLowerCase() : null
					// Extract and prepare meta fields
					row.meta = {
						block: row?.block
							? externalEntityNameIdMap?.[row.block?.replaceAll(/\s+/g, '').toLowerCase()]?._id || null
							: '',
						state: row?.state
							? externalEntityNameIdMap?.[row.state?.replaceAll(/\s+/g, '').toLowerCase()]?._id || null
							: '',
						school: row?.school
							? externalEntityNameIdMap?.[row.school?.replaceAll(/\s+/g, '').toLowerCase()]?._id || null
							: '',
						cluster: row?.cluster
							? externalEntityNameIdMap?.[row.cluster?.replaceAll(/\s+/g, '').toLowerCase()]?._id || null
							: '',
						district: row?.district
							? externalEntityNameIdMap?.[row.district?.replaceAll(/\s+/g, '').toLowerCase()]?._id || null
							: '',
						professional_role: row?.professional_role
							? externalEntityNameIdMap?.[row.professional_role?.replaceAll(/\s+/g, '').toLowerCase()]
									?._id || ''
							: '',
						professional_subroles: row?.professional_subroles
							? row.professional_subroles
									.split(',')
									.map(
										(prof_subRole) =>
											externalEntityNameIdMap[prof_subRole?.replaceAll(/\s+/g, '').toLowerCase()]
												?._id
									) || []
							: [],
					}

					delete row.block
					delete row.state
					delete row.school
					delete row.cluster
					delete row.district
					delete row.professional_role
					delete row.professional_subroles

					// Handle password field if exists
					if (row.password) {
						row.password = row.password.trim()
					}

					parsedCSVData.push(row)
				})
			)

			return {
				success: true,
				result: {
					data: parsedCSVData,
					additionalCsvHeaders,
				},
			}
		} catch (error) {
			return {
				success: false,
				message: error.message,
			}
		}
	}

	static async createUserInvites(
		csvData,
		user,
		fileUploadId,
		additionalCsvHeaders = [],
		invitationId,
		tenantMeta,
		uploadType
	) {
		try {
			console.log(
				'******************************** User bulk Upload STARTS Here ********************************'
			)
			let duplicateChecker = []
			const outputFileName = utils.generateFileName(common.inviteeOutputFile, common.csvExtension)

			//find default org id
			const defaultOrg = await organizationQueries.findOne({
				code: process.env.DEFAULT_ORGANISATION_CODE,
				tenant_code: user.tenant_code,
			})
			const defaultOrgId = defaultOrg?.id || null

			//get all the roles and map title and id
			const roleList = await roleQueries.findAll({
				user_type: common.ROLE_TYPE_NON_SYSTEM,
				status: common.ACTIVE_STATUS,
				organization_id: {
					[Op.in]: [defaultOrgId, user.organization_id],
				},
				tenant_code: user.tenant_code,
			})
			const roleTitlesToIds = {}
			roleList.forEach((role) => {
				roleTitlesToIds[role.title] = [role.id]
			})

			//get all existing user
			const emailArray = _.uniq(_.map(csvData, 'email').filter((email) => email && email.trim())).map((email) =>
				emailEncryption.encrypt(email.trim().toLowerCase())
			)

			//get all existing user with phone
			const phoneArray = _.uniq(_.map(csvData, 'phone').filter((phone) => phone && phone.trim())).map((phone) =>
				emailEncryption.encrypt(phone.trim().toLowerCase())
			)

			//get all user names
			const userNameArray = _.uniq(_.map(csvData, 'username'))
				.filter((username) => _.isString(username) && username.trim() !== '')
				.map((username) => username)
			const userCredQuery = {
				[Op.or]: [
					emailArray && emailArray.length ? { email: { [Op.in]: emailArray } } : null,
					phoneArray && phoneArray.length ? { phone: { [Op.in]: phoneArray } } : null,
				].filter((condition) => condition !== null),
				tenant_code: user.tenant_code,
			}

			const userCredentials = await userQueries.findAllUserWithOrganization(userCredQuery, {}, user.tenant_code)

			const userPresentWithUsername = await userQueries.findAll(
				{ username: { [Op.in]: userNameArray }, tenant_code: user.tenant_code },
				{
					attributes: ['username'],
				}
			)

			const alreadyTakenUserNames = userPresentWithUsername.map((user) => user.username)

			const existingUsers = userCredentials.map((user) => {
				return {
					id: user.id,
					email: user.email,
					phone: user.phone,
					phone_code: user.phone_code,
					organizationIds: user.organizations.map((org) => org.id),
					organizations: user.organizations,
					roles: user?.organizations?.[0]?.roles.map((role) => ({
						title: role.title,
						id: role.id,
					})),
					meta: user.meta,
				}
			})
			//Get All The Users From Database based on UserIds From UserCredentials
			const existingEmailsMap = new Map(existingUsers.map((eachUser) => [eachUser.email, eachUser])) //Figure Out Who Are The Existing Users
			const existingPhoneMap = new Map(
				existingUsers.map((eachUser) => [`${eachUser.phone_code}${eachUser.phone}`, eachUser])
			)

			let input = []
			let isErrorOccured = false
			let isOrgUpdate = false

			const validationData = await entityTypeQueries.findUserEntityTypesAndEntities({
				status: 'ACTIVE',
				organization_id: {
					[Op.in]: [user.organization_id, defaultOrg.id],
				},
				tenant_code: user.tenant_code,
				model_names: { [Op.contains]: [modelName] },
			})
			const prunedEntities = utils.removeDefaultOrgEntityTypes(validationData, user.organization_id)

			//fetch generic email template

			//find already invited users
			const invitedUserList = await userInviteQueries.findAll(
				{
					[Op.or]: [
						emailArray && emailArray.length ? { email: { [Op.in]: emailArray } } : null,
						phoneArray && phoneArray.length ? { phone: { [Op.in]: phoneArray } } : null,
						userNameArray && userNameArray.length ? { username: { [Op.in]: userNameArray } } : null,
					].filter((condition) => condition !== null),
					tenant_code: user.tenant_code,
				},
				{
					isValid: true,
				}
			)
			const existingInvitees = new Map(
				invitedUserList
					.map((user) => {
						const key =
							user?.email ?? (user?.phone ? `${user.phone_code}${user.phone}` : null) ?? user?.username

						return key ? [key, user] : null
					})
					.filter(Boolean)
			)

			const tenantDomains = await tenantDomainQueries.findOne({ tenant_code: user.tenant_code })
			const tenantDetails = await tenantQueries.findOne({ code: user.tenant_code }, { raw: true })

			// process csv data
			for (const invitee of csvData) {
				let userNameMessage = ''
				invitee.email = invitee.email.trim().toLowerCase()
				invitee.roles = Array.isArray(invitee?.roles) ? invitee.roles.map((role) => role.trim()) : []
				const raw_email = invitee.email.toLowerCase() || null
				const encryptedEmail = raw_email ? emailEncryption.encrypt(raw_email) : null
				const hashedPassword = uploadType != common.TYPE_INVITE ? utils.hashPassword(invitee.password) : ''
				invitee.name = invitee.name.trim()

				//find the invalid fields and generate error message
				let invalidFields = []
				let duplicateValues = []
				if (!utils.isValidName(invitee.name)) {
					invalidFields.push('name')
				}
				const isEmailValid = utils.isValidEmail(invitee.email)
				if (invitee?.email.toString() != '' && !isEmailValid) {
					invalidFields.push('email')
				}
				// check if the email is duplicate
				if (invitee?.email.toString() != '' && isEmailValid && duplicateChecker.includes(invitee?.email)) {
					duplicateValues.push('email')
				}

				if (
					!utils.isValidPassword(invitee.password) &&
					uploadType.trim().toLowerCase() != common.TYPE_INVITE.trim().toLowerCase()
				) {
					invalidFields.push('password')
				}
				if (!invitee.email && !invitee.phone) {
					// 	invalidFields.push('phone')
					// 	invalidFields.push('email')
					emailAndPhoneMissing = true
				}

				if (invitee.phone && !invitee.phone_code) {
					invalidFields.push('phone_code')
				}
				// check if the phone is duplicate
				if (invitee.phone && invitee.phone_code) {
					if (duplicateChecker.includes(`${invitee.phone_code}${invitee.phone}`)) {
						duplicateValues.push('phone')
					}
					const phoneCodeEntityType =
						prunedEntities.find((entityType) => entityType.value == 'phone_code') || null
					if (phoneCodeEntityType && phoneCodeEntityType.has_entities) {
						const findEntity = phoneCodeEntityType.entities.find((ent) => ent.value == invitee.phone_code)
						!findEntity ? invalidFields.push('phone_code') : null
					}
					const regex = /^[0-9]{7,15}$/
					!regex.test(invitee?.phone) ? invalidFields.push('phone') : null
				}

				if (invitee?.username) {
					const regex = /^(?:[a-z0-9_-]{3,40}|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})$/
					!regex.test(invitee?.username) ? invalidFields.push('username') : null
				}

				let encryptedPhoneNumber = ''
				if (invitee?.phone) {
					encryptedPhoneNumber = emailEncryption.encrypt(invitee?.phone)
				}
				prunedEntities.forEach((entity) => {
					/*
					findField to find the field from the input data.
					below condition will see if the entity type value is present inside meta of the input data, 
					if present return the entity type and value as key value 
					example 
					invitee.meta = {
						block : block_id
					}
					findField = { block : block_id }
					*/

					/*
						if field is not found in meta key , search it in the entire input body
					*/
					const fieldValue = invitee?.meta?.[entity.value] ?? invitee?.[entity.value]

					if (entity.required) {
						if (entity.data_type === 'ARRAY' || entity.data_type === 'ARRAY[STRING]') {
							if (!fieldValue?.length || fieldValue.some((item) => !item)) {
								invalidFields.push(entity.value)
							}
						} else if (!fieldValue) {
							invalidFields.push(entity.value)
						}
					}
				})

				const invalidRoles = invitee.roles.filter((role) => !roleTitlesToIds.hasOwnProperty(role.toLowerCase()))
				if (invalidRoles.length > 0) {
					invalidFields.push('roles')
				}

				//merge all error message
				invalidFields = [...new Set(invalidFields)]
				duplicateValues = [...new Set(duplicateValues)]
				let errorMessageArray = []
				if (invalidFields.length > 0) {
					let errorMessage = `${
						invalidFields.length > 2
							? invalidFields.slice(0, -1).join(', ') + ', and ' + invalidFields.slice(-1)
							: invalidFields.join(' and ')
					} ${invalidFields.length > 1 ? 'are' : 'is'} invalid.`
					// if (emailAndPhoneMissing) errorMessage = `${errorMessage} Either email or phone is Mandatory.`
					errorMessageArray.push(errorMessage)
				}

				if (duplicateValues.length > 0) {
					let errorMessage = `${
						duplicateValues.length > 2
							? duplicateValues.slice(0, -1).join(', ') + ', and ' + duplicateValues.slice(-1)
							: duplicateValues.join(' and ')
					} ${duplicateValues.length > 1 ? 'are' : 'is'} repeated in the file.`
					// if (emailAndPhoneMissing) errorMessage = `${errorMessage} Either email or phone is Mandatory.`
					errorMessageArray.push(errorMessage)
				}

				if (errorMessageArray.length > 0) {
					invitee.roles = invitee.roles.length > 0 ? invitee.roles.join(',') : ''
					delete invitee.meta
					invitee.statusOrUserId = errorMessageArray.join('. ')
					input.push(invitee)
					continue
				}

				const existingUser =
					existingEmailsMap.get(encryptedEmail) ||
					existingPhoneMap.get(`${invitee.phone_code}${encryptedPhoneNumber}`) ||
					null
				//return error for already invited user
				if (
					!existingUser &&
					(existingInvitees.has(encryptedEmail) ||
						existingInvitees.has(`${invitee.phone_code}${encryptedPhoneNumber}`) ||
						existingInvitees.has(invitee.username)) &&
					uploadType == common.TYPE_INVITE
				) {
					console.log('aaaaa')
					const user =
						existingInvitees.get(encryptedEmail) ||
						existingInvitees.get(`${invitee.phone_code}${encryptedPhoneNumber}`) ||
						existingInvitees.get(invitee.username) ||
						null
					invitee.statusOrUserId = user
						? user.status == common.INVITED_STATUS
							? `User already ${common.INVITED_STATUS}`
							: `User already  ${common.SIGNEDUP_STATUS}`
						: 'User already exist or invited'
					invitee.roles = invitee.roles.length > 0 ? invitee.roles.join(',') : ''
					delete invitee.meta
					input.push(invitee)
					continue
				}

				// Update user details if the user exists and belongs to the default organization
				if (existingUser) {
					invitee.statusOrUserId = 'User already exist and updated'
					isErrorOccured = true
					let isRoleUpdated = false

					const isOrganizationMatch =
						existingUser.organizationIds.includes(defaultOrgId) ||
						existingUser.organizationIds.includes(user.organization_id)

					if (isOrganizationMatch) {
						let userUpdateData = {}

						//update user organization
						if (!existingUser.organizationIds.includes(user.organization_id)) {
							const currentOrgs = await userOrganizationQueries.findAll(
								{
									user_id: existingUser.id,
									tenant_code: user.tenant_code,
								},
								{
									attributes: ['organization_code', 'tenant_code'],
								}
							)
							if (currentOrgs.length <= 0) {
								invitee.statusOrUserId = `User not found in tenant : ${user.tenant_code} `
								continue
							}
							await organizationQueries.create({
								user_id: existingUser.id,
								organization_code: user.organization_code,
								tenant_code: user.tenant_code,
								created_at: new Date(),
								updated_at: new Date(),
							})

							isOrgUpdate = true
						}
						//find the new roles
						const elementsNotInArray = _.difference(
							_.map(invitee.roles, (role) => roleTitlesToIds[role.toLowerCase()]).flat(),
							existingUser.roles.map((role) => role.id)
						)
						let rolesPromises = []
						//update the user roles and handle downgrade of role
						if (elementsNotInArray.length > 0) {
							isRoleUpdated = true
							rolesPromises = elementsNotInArray.map((roleId) => {
								return userRolesQueries.create({
									tenant_code: user.tenant_code,
									user_id: existingUser.id,
									organization_code: user.organization_code,
									role_id: roleId,
									created_at: new Date(),
									updated_at: new Date(),
								})
							})

							await Promise.all(rolesPromises)
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
							userUpdateData.password = hashedPassword
						}

						if (invitee.name) {
							userUpdateData.name = invitee.name
						}

						//update user and user credentials table with new role organization
						if (
							isOrgUpdate ||
							userUpdateData.roles ||
							userUpdateData.meta ||
							userUpdateData.password_update
						) {
							// const userCred = await UserCredentialQueries.findOne({
							// 	email: encryptedEmail,
							// })

							const [count, userUpdate] = await userQueries.updateUser(
								{ id: existingUser.id },
								userUpdateData
							)

							let modifiedKeys = Object.keys(userUpdate[0].dataValues).filter((key) => {
								const current = userUpdate[0].dataValues[key]
								const previous = userUpdate[0]._previousDataValues[key]
								return current !== previous && !_.isEqual(current, previous)
							})
							modifiedKeys = keysFilter(modifiedKeys)

							let oldValues = {},
								newValues = {},
								userFetch = {}
							if (isOrgUpdate || isRoleUpdated) {
								oldValues.organizations = existingUser.organizations
								userFetch = await userQueries.findAllUserWithOrganization(
									{ id: existingUser.id },
									{},
									user.tenant_code
								)

								newValues.organizations = userFetch[0].organizations
							}

							if (modifiedKeys.length > 0 || additionalCsvHeaders.length > 0) {
								if (Object.keys(userFetch).length == 0) {
									userFetch = await userQueries.findAllUserWithOrganization(
										{ id: existingUser.id },
										{},
										user.tenant_code
									)
								}

								userFetch = userCredentials.find((user) => user.id == existingUser.id)
								let userMeta = { ...userFetch?.meta }
								userFetch = await utils.processDbResponse(userFetch, prunedEntities)
								const comparisonKeys = [...modifiedKeys, ...additionalCsvHeaders]
								comparisonKeys.forEach((modifiedKey) => {
									if (modifiedKey == 'meta') {
										/*
										user meta with entity and _id from external micro-service is passed with entity information and value of the _ids
										to prarse it to a standard format with data for emitting the event
										*/
										const metaData = utils.parseMetaData(
											userUpdate[0].dataValues.meta,
											prunedEntities,
											externalEntityNameIdMap
										)
										newValues = {
											...newValues,
											...metaData,
										}
									} else if (additionalCsvHeaders.includes(modifiedKey)) {
										newValues[modifiedKey] = invitee[modifiedKey]
									} else {
										newValues[modifiedKey] = userUpdate[0].dataValues[modifiedKey]
									}
								})

								oldValues = userFetch
								oldValues.email = oldValues.email
									? emailEncryption.decrypt(oldValues.email)
									: oldValues.email
								/*
								user meta with entity and _id from external micro-service is passed with entity information and value of the _ids
								to prarse it to a standard format with data for emitting the event
								*/
								userMeta = utils.parseMetaData(userMeta, prunedEntities, externalEntityNameIdMap)
								oldValues = {
									...oldValues,
									...userMeta,
								}
								oldValues.phone = oldValues.phone
									? emailEncryption.decrypt(oldValues.phone)
									: oldValues.phone
							}

							if (Object.keys(oldValues).length > 0 || Object.keys(newValues).length > 0) {
								const eventBody = eventBodyDTO({
									entity: 'user',
									eventType: 'bulk-update',
									entityId: userUpdate[0].dataValues.id,
									args: {
										userId: userUpdate[0].dataValues?.id,
										username: userUpdate[0].dataValues?.username,
										status: userUpdate[0].dataValues?.status,
										deleted: userUpdate[0].dataValues?.deleted_at ? true : false,
										oldValues,
										newValues,
									},
								})

								broadcastUserEvent('userEvents', { requestBody: eventBody, isInternal: true })
							}

							// Update UserCredential with organization_id and potentially password
							// const credentialUpdateData = { organization_id: user.organization_id }

							// // Add password to update data if provided
							// if (invitee.password) {
							// 	// Assuming you have a password hashing utility
							// 	// You might need to adjust this based on your password handling
							// 	credentialUpdateData.password = invitee.password // Consider hashing
							// }

							// await UserCredentialQueries.updateUser(
							// 	{
							// 		email: encryptedEmail,
							// 	},
							// 	credentialUpdateData
							// )

							const currentRoles = existingUser.roles.map((role) => role.title)
							let newRoles = []
							if (userUpdateData?.roles) {
								newRoles = _.difference(userUpdateData.roles, existingUser.roles).map(
									(role) => role.title
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
							// if user is trying to update username , inform it is not possible to update username.
							if (existingUser.username != invitee.username) {
								invitee.username = userUpdate[0].dataValues['username']
								invitee.statusOrUserId = `${invitee.statusOrUserId}. However username cannot be updated.`
							}
						} else {
							invitee.statusOrUserId = 'No updates needed. User details are already up to date'
						}
					} else {
						//user doesn't have access to update user data
						invitee.statusOrUserId = 'Unauthorised to bulk upload user from another organisation'
						continue
					}
				}
				if (!existingUser && uploadType == common.TYPE_UPLOAD.trim().toUpperCase()) {
					if (invitee.phone_code && invitee.phone)
						duplicateChecker.push(`${invitee.phone_code}${invitee.phone}`)
					if (invitee.email) duplicateChecker.push(invitee.email)
					const validInvitation =
						existingInvitees.get(encryptedEmail) ||
						existingInvitees.get(`${invitee.phone_code}${encryptedPhoneNumber}`) ||
						existingInvitees.get(invitee.username) ||
						null
					// if the user is already invited , update the status to uploaded
					if (validInvitation) {
						await userInviteQueries.update(
							{
								id: validInvitation.id,
							},
							{
								status: common.UPLOADED_STATUS,
								type: common.TYPE_UPLOAD,
							}
						)
					}
					//new user invitee creation
					const inviteeData = {
						...invitee,
						status: common.UPLOADED_STATUS,
						type: common.TYPE_UPLOAD,
						organization_code: user.organization_code,
						tenant_code: user.tenant_code,
						file_id: fileUploadId,
						roles: (invitee.roles || []).map((roleTitle) => roleTitlesToIds[roleTitle.toLowerCase()] || []),
						email: encryptedEmail,
						meta: invitee.meta || {},
						invitation_id: invitationId,
						invitation_key: null,
						invitation_code: null,
					}

					inviteeData.email = encryptedEmail
					if (
						!inviteeData?.username ||
						alreadyTakenUserNames.includes(inviteeData?.username) ||
						inviteeData?.username.toString() == '' ||
						duplicateChecker.includes(inviteeData?.username)
					) {
						if (alreadyTakenUserNames.includes(inviteeData?.username)) {
							userNameMessage = 'Username you provided was already taken, '
						} else if (!inviteeData?.username || inviteeData?.username.toString() == '') {
							userNameMessage = 'Username field empty, '
						} else if (duplicateChecker.includes(inviteeData?.username)) {
							userNameMessage = 'Username is repeating in the file. '
						} else {
							userNameMessage = ''
						}

						userNameMessage += 'Hence system generated a unique username.'

						inviteeData.username = await generateUniqueUsername(
							inviteeData?.name.trim().replace(/\s+/g, '_')
						)
					}
					duplicateChecker.push(inviteeData.username)
					const newInvitee = validInvitation ? validInvitation : await userInviteQueries.create(inviteeData)

					// if the username is taken generate random username and inform user

					if (newInvitee?.id) {
						invitee.statusOrUserId = newInvitee.id
						if (userNameMessage.toString() != '') {
							invitee.statusOrUserId = `User Invite Id :  ${invitee.statusOrUserId} and ${userNameMessage}`
						}
						const insertedUser = await userQueries.create({
							name: inviteeData.name,
							email: inviteeData?.email || null,
							phone_code: inviteeData?.phone_code || null,
							phone: inviteeData?.phone ? encryptedPhoneNumber : null,
							username: inviteeData?.username,
							roles: inviteeData?.roles || [],
							password: hashedPassword,
							meta: inviteeData.meta,
							organization_id: inviteeData.organization_id,
							tenant_code: user.tenant_code,
						})
						const orgCode = await organizationQueries.findOne(
							{
								id: user.organization_id,
								tenant_code: user.tenant_code,
							},
							{
								attributes: ['code'],
							}
						)
						const userOrgBody = {
							user_id: insertedUser?.id,
							organization_code: orgCode.code,
							tenant_code: user.tenant_code,
							created_at: new Date(),
							updated_at: new Date(),
						}

						const userOrgResponse = await userOrganizationQueries.create(userOrgBody)

						const userOrganizationRolePromise = inviteeData.roles.map((role) => {
							return userOrganizationRoleQueries.create({
								tenant_code: user.tenant_code,
								user_id: insertedUser?.id,
								organization_code: orgCode.code,
								role_id: role,
							})
						})

						const userOrgRoleRes = await Promise.all(userOrganizationRolePromise)
						invitee.username = inviteeData?.username // keeping the data in sync for the output file. Username can be updated / generated if the username is clashing or not provided respectively.
						/*
						user meta with entity and _id from external micro-service is passed with entity information and value of the _ids
						to prarse it to a standard format with data for emitting the event
						*/
						const metaData = utils.parseMetaData(inviteeData.meta, prunedEntities, externalEntityNameIdMap)

						let userWithOrg = await userQueries.findUserWithOrganization(
							{
								id: insertedUser?.id,
								tenant_code: user?.tenant_code,
							},
							{}
						)
						prunedEntities.forEach((entity) => {
							if (entity.data_type == 'ARRAY' || entity.data_type == 'ARRAY[STRING]') {
								inviteeData[entity.value] = inviteeData[entity.value]
									? inviteeData[entity.value].split(',')
									: ''
							}
						})
						const parsedData = await utils.processDbResponse(inviteeData, prunedEntities)
						const organizations = userWithOrg.organizations
						let args = {
							created_by: user.id,
							name: parsedData?.name,
							username: parsedData?.username,
							email: raw_email,
							phone: parsedData?.phone ? parsedData?.phone : null,
							organizations,
							tenant_code: user?.tenant_code,
							...metaData,
							status: insertedUser.status,
							deleted: false,
							id: insertedUser?.id,
						}

						additionalCsvHeaders.forEach((additionalKeys) => {
							args[additionalKeys] = inviteeData[additionalKeys]
						})

						const eventBody = eventBodyDTO({
							entity: 'user',
							eventType: 'bulk-create',
							entityId: insertedUser?.id,
							args,
						})

						broadcastUserEvent('userEvents', { requestBody: eventBody, isInternal: true })

						if (insertedUser?.id) {
							const { name, email } = invitee

							const roles =
								organizations.length > 0
									? organizations.flatMap((org) =>
											org.roles && Array.isArray(org.roles)
												? org.roles.map((role) => role.title)
												: []
									  )
									: []
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

							if (userData?.email) {
								notificationUtils.sendEmailNotification({
									emailId: userData.email,
									templateCode: process.env.BULK_CREATE_TEMPLATE_CODE,
									variables: {
										name: user.name,
										orgName: userData.org_name,
										appName: tenantDetails.name,
										roles: roleToString || '',
										portalURL: tenantDomains.domain,
										username: inviteeData.username,
									},
									tenantCode: tenantDetails.code,
								})
							}

							// Send SMS notification with OTP if phone is provided
							if (userData?.phone) {
								notificationUtils.sendSMSNotification({
									phoneNumber: userData.phone,
									templateCode: process.env.BULK_CREATE_TEMPLATE_CODE,
									variables: {
										name: user.name,
										orgName: userData.org_name,
										appName: tenantDetails.name,
										roles: roleToString || '',
										portalURL: tenantDomains.domain,
										username: inviteeData.username,
									},
									tenantCode: tenantDetails.code,
								})
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
				} else if (!existingUser && uploadType == common.TYPE_INVITE.trim().toUpperCase()) {
					const raw_phone = invitee?.phone || null
					const inviteCodeString = await generateUniqueCodeString(4)
					// first letter of tenant code + random string of len 4 + random digit of len 4 + firrst letter of org code
					const invitation_code = `${String(user.tenant_code)
						.slice(0, 1)
						.toUpperCase()}${inviteCodeString}${utils.generateSecureOTP(4)}${String(user.organization_code)
						.slice(0, 1)
						.toUpperCase()}`
					const inviteeData = {
						...invitee,
						type: common.INVITED_STATUS,
						status: common.INVITED_STATUS,
						organization_code: user.organization_code,
						file_id: fileUploadId,
						roles: (invitee.roles || []).map((roleTitle) => roleTitlesToIds[roleTitle.toLowerCase()] || []),
						meta: invitee.meta || {},
						invitation_id: invitationId,
						invitation_key: utils.generateUUID(),
						tenant_code: user.tenant_code,
						invitation_code,
					}
					inviteeData.email = encryptedEmail
					inviteeData.username = inviteeData?.username
						? inviteeData?.username
						: await generateUniqueUsername(inviteeData?.name)

					invitee.username = inviteeData.username // keeping the data in sync for the output file. Username can be updated / generated if the username is clashing or not provided respectively.

					const newInvitee = await userInviteQueries.create(inviteeData)
					invitee.statusOrUserId = 'User Invited successfully'

					loginUrl = utils.appendParamsToUrl(tenantMeta.portalSignInUrl, {
						invitation_key: inviteeData.invitation_key,
					})

					if (raw_email) {
						notificationUtils.sendEmailNotification({
							emailId: raw_email,
							templateCode: process.env.GENERIC_INVITATION_EMAIL_TEMPLATE_CODE,
							variables: {
								name: inviteeData?.name,
								orgName: user?.org_name,
								appName: user?.name,
								roles: invitee.roles.length > 0 ? invitee.roles.join(',') : '',
								portalURL: loginUrl,
								username: inviteeData.username,
								registerCode: inviteeData.invitation_code,
							},
							tenantCode: user.tenant_code,
							organization_id: user.organization_id,
						})
					}

					// Send SMS notification with OTP if phone is provided
					if (raw_phone) {
						notificationUtils.sendSMSNotification({
							phoneNumber: raw_phone,
							templateCode: process.env.GENERIC_INVITATION_EMAIL_TEMPLATE_CODE,
							variables: {
								name: user.name,
								orgName: userData.org_name,
								appName: tenantDetails.name,
								roles: invitee.roles.length > 0 ? invitee.roles.join(',') : '' || '',
								portalURL: loginUrl,
								username: inviteeData.username,
								registerCode: inviteeData.invitation_code,
							},
							tenantCode: user.tenant_code,
							organization_id: user.organization_id,
						})
					}
				}

				//convert roles array to string
				invitee.roles = invitee.roles.length > 0 ? invitee.roles.join(',') : ''
				if (invitee.statusOrUserId == 'Success' && userNameMessage.toString() != '') {
					invitee.statusOrUserId = `${invitee.statusOrUserId} and ${userNameMessage}`
				}
				if (uploadType == common.TYPE_INVITE && emailAndPhoneMissing) {
					invitee.statusOrUserId = `${invitee.statusOrUserId} , Login URL : ${loginUrl}`
				}
				delete invitee.meta
				input.push(invitee)
			}

			//generate output csv
			const csvContent = utils.generateCSVContent(input)
			const outputFilePath = path.join(inviteeFileDir, outputFileName)
			fs.writeFileSync(outputFilePath, csvContent)
			console.log('******************************** User bulk Upload ENDS Here ********************************')
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

	static async sendInviteeEmail(userData, inviteeUploadURL = null) {
		try {
			if (!userData?.email) {
				console.warn('Admin email not found!')
				return { success: false }
			}
			await notificationUtils.sendEmailNotification({
				emailId: userData.email,
				templateCode: process.env.ADMIN_INVITEE_UPLOAD_EMAIL_TEMPLATE_CODE,
				variables: {
					name: userData.name,
					downloadLink: inviteeUploadURL,
				},
				tenantCode: userData.tenant_code,
				organization_id: userData.organization_id,
			})
			return {
				success: true,
			}
		} catch (error) {
			console.log(error)
			throw error
		}
	}
	static async sendErrorEmail(userData, message) {
		try {
			await notificationUtils.sendEmailNotification({
				emailId: userData.email,
				templateCode: process.env.ADMIN_INVITEE_UPLOAD_ERROR_EMAIL_TEMPLATE_CODE,
				variables: {
					name: userData.name,
					orgName: userData.org_name,
					error: message,
				},
				tenantCode: userData.tenant_code,
				organization_id: userData.organization_id,
			})
			return {
				success: true,
			}
		} catch (error) {
			console.log(error)
			throw error
		}
	}
}
