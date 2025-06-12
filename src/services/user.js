/**
 * name : users.js
 * author : Priyanka Pradeep
 * created-date : 17-July-2023
 * Description : User Service Helper.
 */

// Dependencies
const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const userQueries = require('@database/queries/users')
const utils = require('@generics/utils')
const roleQueries = require('@database/queries/user-role')
//const entitiesQueries = require('@database/queries/entities')
const entityTypeQueries = require('@database/queries/entityType')
const organizationQueries = require('@database/queries/organization')
const { removeDefaultOrgEntityTypes } = require('@generics/utils')
const _ = require('lodash')
const { Op } = require('sequelize')
const { eventBroadcaster } = require('@helpers/eventBroadcaster')
const emailEncryption = require('@utils/emailEncryption')
const responses = require('@helpers/responses')
const rolePermissionMappingQueries = require('@database/queries/role-permission-mapping')
const { eventBodyDTO, keysFilter } = require('@dtos/userDTO')

const { broadcastUserEvent } = require('@helpers/eventBroadcasterMain')

module.exports = class UserHelper {
	/**
	 * update profile
	 * @method
	 * @name update
	 * @param {Object} bodyData - it contains user infomration
	 * @param {string} pageSize -request data.
	 * @param {string} searchText - search text.
	 * @returns {JSON} - update user response
	 */
	static async update(bodyData, id, orgId, tenantCode) {
		try {
			if (bodyData.hasOwnProperty('email')) {
				return responses.failureResponse({
					message: 'EMAIL_UPDATE_FAILED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const user = await userQueries.findOne({
				id: id,
				tenant_code: tenantCode,
			})

			if (!user) {
				return responses.failureResponse({
					message: 'USER_NOT_FOUND',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}

			let defaultOrg = await organizationQueries.findOne(
				{ code: process.env.DEFAULT_ORGANISATION_CODE, tenant_code: tenantCode },
				{ attributes: ['id'] }
			)
			let defaultOrgId = defaultOrg.id

			const filter = {
				status: 'ACTIVE',
				organization_id: {
					[Op.in]: [orgId, defaultOrgId],
				},
				tenant_code: tenantCode,
				model_names: { [Op.contains]: [await userQueries.getModelName()] },
			}
			let validationData = await entityTypeQueries.findUserEntityTypesAndEntities(filter)
			const prunedEntities = removeDefaultOrgEntityTypes(validationData)
			const metaDataKeys = validationData.map((meta) => meta.value)

			//validationData = utils.removeParentEntityTypes(JSON.parse(JSON.stringify(validationData)))

			let res = utils.validateInput(bodyData, prunedEntities, await userQueries.getModelName())
			if (!res.success) {
				return responses.failureResponse({
					message: 'VALIDATION_FAILED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
					result: res.errors,
				})
			}

			let userModel = await userQueries.getColumns()
			bodyData.updated_at = new Date().getTime()
			bodyData = utils.restructureBody(bodyData, validationData, userModel)

			// Check if 'user_roles' is present in the request body and is not empty
			if (bodyData.roles && bodyData.roles.length > 0) {
				// Fetch the existing roles for the user from the database
				const fetchExistingRole = await userQueries.findOne({ id: id }, { attributes: ['roles'] })
				const existingRoleIds = fetchExistingRole.roles
				// Validate the existing roles with user_type = 1 (system admin roles)
				const validatedExistingRoleIds = await this.validateUserRoles(existingRoleIds, false)

				// Get the new roles from the request body
				const newUserRoleId = bodyData.roles
				// Validate the combined list of roles
				const validatedUserRoleIds = await this.validateUserRoles(newUserRoleId)
				// Combine new roles and existing system admin roles
				let newUserRoleIds = [...validatedUserRoleIds, ...validatedExistingRoleIds]

				bodyData.roles = newUserRoleIds // Add validated user_role IDs to roles key
			}

			// remove body data from the roles from the request if it is empty
			if (bodyData.roles && !bodyData.roles.length > 0) {
				delete bodyData.roles
			}
			const [affectedRows, updatedData] = await userQueries.updateUser(
				{ id: id, tenant_code: tenantCode },
				bodyData
			)

			const currentUser = updatedData[0]

			const currentName = currentUser.dataValues.name
			const previousName = currentUser._previousDataValues?.name || null

			const modifiedKeys = keysFilter(
				_.keys(currentUser.dataValues).filter((key) => {
					return !_.isEqual(currentUser.dataValues[key], currentUser._previousDataValues[key])
				})
			)

			if (currentName !== previousName) {
				eventBroadcaster('updateName', {
					requestBody: {
						mentor_name: currentName,
						mentor_id: id,
					},
				})
			}
			const redisUserKey = common.redisUserPrefix + tenantCode + '_' + id.toString()
			if (await utils.redisGet(redisUserKey)) {
				await utils.redisDel(redisUserKey)
			}
			const processDbResponse = await utils.processDbResponse(
				JSON.parse(JSON.stringify(updatedData[0])),
				validationData
			)
			delete processDbResponse.refresh_tokens
			delete processDbResponse.password

			if (processDbResponse?.email) {
				processDbResponse.email = emailEncryption.decrypt(processDbResponse?.email)
			}

			if (processDbResponse?.phone) {
				processDbResponse.phone = emailEncryption.decrypt(processDbResponse?.phone)
			}

			if (modifiedKeys.length > 0) {
				let userMeta = { ...user?.meta }
				let oldValues = await utils.processDbResponse(user, prunedEntities),
					newValues = {}
				userMeta = utils.parseMetaData(userMeta, prunedEntities, oldValues)
				oldValues.email = oldValues?.email ? emailEncryption.decrypt(oldValues.email) : oldValues.email
				oldValues.phone = oldValues?.phone ? emailEncryption.decrypt(oldValues.phone) : oldValues.phone
				oldValues = {
					...oldValues,
					...userMeta,
				}

				modifiedKeys.forEach((key) => {
					if (key == 'meta') {
						const metaData = utils.parseMetaData(bodyData[key], prunedEntities, processDbResponse)

						newValues = {
							...newValues,
							...metaData,
						}
					} else {
						newValues[key] = currentUser.dataValues[key]
					}
				})

				const eventBody = eventBodyDTO({
					entity: 'user',
					eventType: 'update',
					entityId: processDbResponse?.id,
					args: {
						oldValues,
						newValues,
					},
				})

				broadcastUserEvent('userEvents', { requestBody: eventBody, isInternal: true })
			}

			return responses.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'PROFILE_UPDATED_SUCCESSFULLY',
				result: processDbResponse,
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	/**
	 * Validates the user roles by checking if the provided role IDs exist in the database.
	 * If the `getSystemUserRoles` flag is true.
	 * @param {Array<number>} userRoleIds - An array of user role IDs to validate.
	 * @param {boolean} [getSystemUserRoles=true] - A flag indicating which filter to use for validation.
	 * @returns {Promise<Array<number>>} - A promise that resolves to an array of valid user role IDs.
	 */
	static async validateUserRoles(userRoleIds = [], getSystemUserRoles = true) {
		// Check if the userRoleIds array is empty
		if (userRoleIds.length <= 0) {
			return responses.failureResponse({
				message: 'ROLE_NOT_FOUND',
				statusCode: httpStatusCode.not_acceptable,
				responseCode: 'CLIENT_ERROR',
			})
		}
		// Determine the filter object based on the getSystemUserRoles flag
		let filter = {
			status: common.ACTIVE_STATUS,
			id: userRoleIds,
		}
		if (getSystemUserRoles == true) {
			filter.user_type = 0
		} else {
			filter.user_type = 1
		}

		const attributes = ['id']
		// Fetching roles from the database that match the provided IDs.
		const userRoleId = await roleQueries.findAll(filter, attributes)
		// Check if no roles were found (roles array is empty).
		if (userRoleId.length < 0) {
			return responses.failureResponse({
				message: 'ROLE_NOT_FOUND',
				statusCode: httpStatusCode.not_acceptable,
				responseCode: 'CLIENT_ERROR',
			})
		}
		// Extracting the IDs of the found roles and storing them in an array.
		const userRoles = userRoleId.map((role) => role.id)
		return userRoles
	}

	/**
	 * Get permissions
	 * @method
	 * @name getPermissions
	 * @param {Array} roles - Array of user roles.
	 * @returns {Array} - Array of permissions by module.
	 */
	static async getPermissions(roles) {
		const roleTitle = roles.map(({ title }) => title)
		const filter = { role_title: roleTitle }
		const attributes = ['module', 'request_type']
		const permissionAndModules = await rolePermissionMappingQueries.findAll(filter, attributes)
		const permissionsByModule = {}
		permissionAndModules.forEach(({ module, request_type }) => {
			if (permissionsByModule[module]) {
				permissionsByModule[module].request_type = [
					...new Set([...permissionsByModule[module].request_type, ...request_type]),
				]
			} else {
				permissionsByModule[module] = { module, request_type: [...request_type] }
			}
		})
		return Object.values(permissionsByModule).map(({ module, request_type }) => ({
			module,
			request_type,
			service: common.USER_SERVICE,
		}))
	}

	/**
	 * user details
	 * @method
	 * @name read
	 * @param {string} _id -userId.
	 * @param {string} language -Language code.
	 * @param {string} searchText - search text.
	 * @returns {JSON} - user information
	 */
	static async read(id, header = null, language, tenantCode) {
		try {
			let filter = {}
			console.log(tenantCode)
			if (utils.isNumeric(id)) {
				filter = { id: id, tenant_code: tenantCode }
			} else {
				filter = { share_link: id }
			}

			const redisUserKey = common.redisUserPrefix + tenantCode + '_' + id.toString()
			const userDetails = (await utils.redisGet(redisUserKey)) || false
			if (!userDetails) {
				let options = {
					attributes: {
						exclude: ['password', 'refresh_tokens'],
					},
				}
				if (header.internal_access_token) {
					options.paranoid = false
				}
				let user = await userQueries.findUserWithOrganization(filter, options)

				if (!user) {
					return responses.failureResponse({
						message: 'USER_NOT_FOUND',
						statusCode: httpStatusCode.unauthorized,
						responseCode: 'UNAUTHORIZED',
					})
				}

				let roles = user.organizations[0].roles

				if (!roles) {
					return responses.failureResponse({
						message: 'ROLE_NOT_FOUND',
						statusCode: httpStatusCode.not_acceptable,
						responseCode: 'CLIENT_ERROR',
					})
				}
				if (language && language !== common.ENGLISH_LANGUGE_CODE) {
					utils.setRoleLabelsByLanguage(roles, language)
				} else {
					roles.map((roles) => {
						delete roles.translations
						return roles
					})
				}

				//user.user_roles = roles

				let defaultOrg = await organizationQueries.findOne(
					{ code: process.env.DEFAULT_ORGANISATION_CODE, tenant_code: tenantCode },
					{ attributes: ['id'] }
				)
				let defaultOrgId = defaultOrg.id
				let userOrg = user.organizations[0].id

				let validationData = await entityTypeQueries.findUserEntityTypesAndEntities({
					status: 'ACTIVE',
					organization_id: {
						[Op.in]: [userOrg, defaultOrgId],
					},
					tenant_code: tenantCode,
					model_names: { [Op.contains]: [await userQueries.getModelName()] },
				})
				const prunedEntities = removeDefaultOrgEntityTypes(validationData, user.organization_id)
				const permissionsByModule = await this.getPermissions(user.organizations[0].roles)
				user.permissions = permissionsByModule

				const processDbResponse = await utils.processDbResponse(user, prunedEntities)

				if (processDbResponse) {
					;['email', 'phone'].forEach((field) => {
						const value = processDbResponse[field]
						if (typeof value === 'string' && value.trim() !== '') {
							processDbResponse[field] = emailEncryption.decrypt(value)
						}
					})
				}

				if (utils.validateRoleAccess(roles, [common.MENTOR_ROLE, common.MENTEE_ROLE])) {
					await utils.redisSet(redisUserKey, processDbResponse, common.redisUserCacheTTL)
				}

				processDbResponse['image_cloud_path'] = processDbResponse.image
				if (processDbResponse && processDbResponse.image) {
					processDbResponse.image = await utils.getDownloadableUrl(processDbResponse.image)
				}
				return responses.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'PROFILE_FETCHED_SUCCESSFULLY',
					result: processDbResponse ? processDbResponse : {},
				})
			} else {
				if (userDetails && userDetails.image) {
					userDetails.image = await utils.getDownloadableUrl(userDetails.image)
				}
				return responses.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'PROFILE_FETCHED_SUCCESSFULLY',
					result: userDetails ? userDetails : {},
				})
			}
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	static async profileById(param, tenantCode = null) {
		try {
			if (Object.keys(param).length == 0) {
				return responses.failureResponse({
					message: 'VALIDATION_FAILED',
					statusCode: httpStatusCode.unprocessable_entity,
					responseCode: 'CLIENT_ERROR',
				})
			}
			if (Object.keys(param).includes('email')) {
				param.email = emailEncryption.encrypt(param.email)
			} else if (Object.keys(param).includes('phone')) {
				param.phone = emailEncryption.encrypt(param.phone)
				param.phone_code = param?.phone_code || process.env.DEFAULT_PHONE_CODE || null
				if (!param?.phone_code) {
					return responses.failureResponse({
						message: 'VALIDATION_FAILED',
						statusCode: httpStatusCode.unprocessable_entity,
						responseCode: 'CLIENT_ERROR',
					})
				}
			}
			let filter = param
			if (tenantCode) {
				filter.tenant_code = tenantCode
			}

			let options = {
				attributes: {
					exclude: ['password', 'refresh_tokens', 'email', 'phone', 'phone_code'],
				},
			}

			options.paranoid = true

			const user = await userQueries.findUserWithOrganization(filter, options)

			if (!user) {
				return responses.failureResponse({
					message: 'USER_NOT_FOUND',
					statusCode: httpStatusCode.not_found,
					responseCode: 'CLIENT_ERROR',
				})
			}

			user.image_cloud_path = user.image
			if (user.image) {
				user.image = await utils.getDownloadableUrl(user.image)
			}
			let defaultOrg = await organizationQueries.findOne(
				{ code: process.env.DEFAULT_ORGANISATION_CODE, tenant_code: tenantCode },
				{ attributes: ['id'] }
			)
			let defaultOrgId = defaultOrg.id
			let userOrg = user.organizations[0].id

			let validationData = await entityTypeQueries.findUserEntityTypesAndEntities({
				status: 'ACTIVE',
				organization_id: {
					[Op.in]: [userOrg, defaultOrgId],
				},
				tenant_code: tenantCode,
				model_names: { [Op.contains]: [await userQueries.getModelName()] },
			})
			const prunedEntities = removeDefaultOrgEntityTypes(validationData, user.organization_id)

			const processDbResponse = await utils.processDbResponse(user, prunedEntities)
			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'USER_PROFILE_FETCHED_SUCCESSFULLY',
				result: processDbResponse,
			})
		} catch (error) {
			console.log('Error in profileById:', error)
			throw error
		}
	}

	/**
	 * Share a mentor Profile.
	 * @method
	 * @name share
	 * @param {String} userId - User id.
	 * @returns {JSON} - Shareable profile link.
	 */

	static async share(userId) {
		try {
			let user = await userQueries.findOne({ id: userId }, { attributes: ['share_link'] })

			if (!user) {
				return responses.failureResponse({
					message: 'USER_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			let shareLink = user.share_link
			if (!shareLink) {
				shareLink = utils.md5Hash(userId)
				await userQueries.updateUser({ id: userId }, { share_link: shareLink })
			}
			return responses.successResponse({
				message: 'PROFILE_SHARE_LINK_GENERATED_SUCCESSFULLY',
				statusCode: httpStatusCode.ok,
				result: { shareLink },
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * Setting preferred language of user
	 * @method
	 * @name setLanguagePreference
	 * @param {Object} bodyData - it contains user preferred language
	 * @returns {JSON} - updated user preferred languages response
	 */
	static async setLanguagePreference(bodyData, id, orgId, tenantCode) {
		try {
			let skipRequiredValidation = true
			const user = await userQueries.findOne({ id: id, tenant_code: tenantCode })
			if (!user) {
				return responses.failureResponse({
					message: 'USER_NOT_FOUND',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}
			let defaultOrg = await organizationQueries.findOne(
				{ code: process.env.DEFAULT_ORGANISATION_CODE, tenant_code: tenantCode },
				{ attributes: ['id'] }
			)
			let defaultOrgId = defaultOrg.id
			let userModel = await userQueries.getColumns()
			const filter = {
				status: common.ACTIVE_STATUS,
				organization_id: { [Op.in]: [orgId, defaultOrgId] },
				model_names: { [Op.contains]: [userModel] },
				value: 'preferred_language',
				tenant_code: tenantCode,
			}
			let dataValidation = await entityTypeQueries.findUserEntityTypesAndEntities(filter)
			const prunedEntities = removeDefaultOrgEntityTypes(dataValidation)

			let validatedData = utils.validateInput(bodyData, prunedEntities, userModel, skipRequiredValidation)
			if (!validatedData.success) {
				return responses.failureResponse({
					message: 'PROFILE_UPDATION_FAILED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
					result: validatedData.errors,
				})
			}
			bodyData.updated_at = new Date().getTime()
			bodyData = utils.restructureBody(bodyData, dataValidation, userModel)

			const [affectedRows, updatedData] = await userQueries.updateUser(
				{ id: id, tenant_code: tenantCode },
				bodyData
			)
			const redisUserKey = common.redisUserPrefix + tenantCode + '_' + id.toString()
			if (await utils.redisGet(redisUserKey)) {
				await utils.redisDel(redisUserKey)
			}
			const processDbResponse = await utils.processDbResponse(
				JSON.parse(JSON.stringify(updatedData[0])),
				dataValidation
			)
			const keysToDelete = ['refresh_tokens', 'password']
			const cleanedResponse = utils.deleteKeysFromObject(processDbResponse, keysToDelete)

			return responses.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'UPDATED_PREFERED_LANGUAGE_SUCCESSFULLY',
				result: cleanedResponse,
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}
}
