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
const entitiesQueries = require('@database/queries/entities')
const entityTypeQueries = require('@database/queries/entityType')
const organizationQueries = require('@database/queries/organization')
const { removeDefaultOrgEntityTypes } = require('@generics/utils')
const _ = require('lodash')
const { Op } = require('sequelize')
const { eventBroadcaster } = require('@helpers/eventBroadcaster')
const emailEncryption = require('@utils/emailEncryption')
const responses = require('@helpers/responses')
const rolePermissionMappingQueries = require('@database/queries/role-permission-mapping')

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
	static async update(bodyData, id, orgId) {
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
				organization_id: orgId,
			})

			if (!user) {
				return responses.failureResponse({
					message: 'USER_NOT_FOUND',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}

			let defaultOrg = await organizationQueries.findOne(
				{ code: process.env.DEFAULT_ORGANISATION_CODE },
				{ attributes: ['id'] }
			)
			let defaultOrgId = defaultOrg.id

			const filter = {
				status: 'ACTIVE',
				organization_id: {
					[Op.in]: [orgId, defaultOrgId],
				},
				model_names: { [Op.contains]: [await userQueries.getModelName()] },
			}
			let validationData = await entityTypeQueries.findUserEntityTypesAndEntities(filter)
			const prunedEntities = removeDefaultOrgEntityTypes(validationData)

			//validationData = utils.removeParentEntityTypes(JSON.parse(JSON.stringify(validationData)))

			let res = utils.validateInput(bodyData, prunedEntities, await userQueries.getModelName())
			if (!res.success) {
				return responses.failureResponse({
					message: 'SESSION_CREATION_FAILED',
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
				{ id: id, organization_id: orgId },
				bodyData
			)

			const currentUser = updatedData[0]

			const currentName = currentUser.dataValues.name
			const previousName = currentUser._previousDataValues?.name || null

			if (currentName !== previousName) {
				eventBroadcaster('updateName', {
					requestBody: {
						mentor_name: currentName,
						mentor_id: id,
					},
				})
			}
			const redisUserKey = common.redisUserPrefix + id.toString()
			if (await utils.redisGet(redisUserKey)) {
				await utils.redisDel(redisUserKey)
			}
			const processDbResponse = utils.processDbResponse(
				JSON.parse(JSON.stringify(updatedData[0])),
				validationData
			)
			delete processDbResponse.refresh_tokens
			delete processDbResponse.password
			processDbResponse.email = emailEncryption.decrypt(processDbResponse.email)
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
	 * @param {string} searchText - search text.
	 * @returns {JSON} - user information
	 */
	static async read(id, internal_access_token = null) {
		try {
			let filter = {}

			if (utils.isNumeric(id)) {
				filter = { id: id }
			} else {
				filter = { share_link: id }
			}

			const redisUserKey = common.redisUserPrefix + id.toString()
			const userDetails = (await utils.redisGet(redisUserKey)) || false
			if (!userDetails) {
				let options = {
					attributes: {
						exclude: ['password', 'refresh_tokens'],
					},
				}
				if (internal_access_token) {
					options.paranoid = false
				}
				const user = await userQueries.findUserWithOrganization(filter, options)
				if (!user) {
					return responses.failureResponse({
						message: 'USER_NOT_FOUND',
						statusCode: httpStatusCode.unauthorized,
						responseCode: 'UNAUTHORIZED',
					})
				}

				let roles = await roleQueries.findAll(
					{ id: user.roles, status: common.ACTIVE_STATUS },
					{
						attributes: {
							exclude: ['created_at', 'updated_at', 'deleted_at'],
						},
					}
				)

				if (!roles) {
					return responses.failureResponse({
						message: 'ROLE_NOT_FOUND',
						statusCode: httpStatusCode.not_acceptable,
						responseCode: 'CLIENT_ERROR',
					})
				}

				user.user_roles = roles

				let defaultOrg = await organizationQueries.findOne(
					{ code: process.env.DEFAULT_ORGANISATION_CODE },
					{ attributes: ['id'] }
				)
				let defaultOrgId = defaultOrg.id

				let validationData = await entityTypeQueries.findUserEntityTypesAndEntities({
					status: 'ACTIVE',
					organization_id: {
						[Op.in]: [user.organization_id, defaultOrgId],
					},
					model_names: { [Op.contains]: [await userQueries.getModelName()] },
				})
				const prunedEntities = removeDefaultOrgEntityTypes(validationData, user.organization_id)
				const permissionsByModule = await this.getPermissions(user.user_roles)
				user.permissions = permissionsByModule

				const processDbResponse = utils.processDbResponse(user, prunedEntities)

				processDbResponse.email = emailEncryption.decrypt(processDbResponse.email)

				if (utils.validateRoleAccess(roles, common.MENTOR_ROLE)) {
					await utils.redisSet(redisUserKey, processDbResponse)
				}

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
	static async setLanguagePreference(bodyData, id, orgId) {
		try {
			let skipRequiredValidation = true
			const user = await userQueries.findOne({ id: id, organization_id: orgId })
			if (!user) {
				return responses.failureResponse({
					message: 'USER_NOT_FOUND',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}
			let defaultOrg = await organizationQueries.findOne(
				{ code: process.env.DEFAULT_ORGANISATION_CODE },
				{ attributes: ['id'] }
			)
			let defaultOrgId = defaultOrg.id
			let userModel = await userQueries.getColumns()
			const filter = {
				status: common.ACTIVE_STATUS,
				organization_id: { [Op.in]: [orgId, defaultOrgId] },
				model_names: { [Op.contains]: [userModel] },
				value: 'preferred_language',
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
				{ id: id, organization_id: orgId },
				bodyData
			)
			const redisUserKey = common.redisUserPrefix + id.toString()
			if (await utils.redisGet(redisUserKey)) {
				await utils.redisDel(redisUserKey)
			}
			const processDbResponse = utils.processDbResponse(
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
