/**
 * name : admin.js
 * author : Priyanka Pradeep
 * created-date : 16-Jun-2023
 * Description : Admin Service Helper.
 */

// Dependencies

const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')
const utils = require('@generics/utils')
const _ = require('lodash')
const userQueries = require('@database/queries/users')
const roleQueries = require('@database/queries/user-role')
const organizationQueries = require('@database/queries/organization')
const { eventBroadcaster } = require('@helpers/eventBroadcaster')
const { Op } = require('sequelize')
const UserCredentialQueries = require('@database/queries/userCredential')
const adminService = require('../generics/materializedViews')
const emailEncryption = require('@utils/emailEncryption')
const responses = require('@helpers/responses')
const userSessionsService = require('@services/user-sessions')

module.exports = class AdminHelper {
	/**
	 * Delete User
	 * @method
	 * @name deleteUser
	 * @param {string} userId -delete user Id.
	 * @returns {JSON} - delete user response
	 */
	static async deleteUser(userId) {
		try {
			let user = await userQueries.findByPk(userId)
			if (!user) {
				return responses.failureResponse({
					message: 'USER_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			let updateParams = _generateUpdateParams(userId)
			const removeKeys = _.omit(user, _removeUserKeys())
			const update = _.merge(removeKeys, updateParams)
			await userQueries.updateUser({ id: user.id, organization_id: user.organization_id }, update)
			delete update.id
			await UserCredentialQueries.forceDeleteUserWithEmail(user.email)

			await utils.redisDel(common.redisUserPrefix + userId.toString())

			/**
			 * Using userId get his active sessions
			 */
			const userSessionData = await userSessionsService.findUserSession(
				{
					user_id: userId,
					ended_at: null,
				},
				{
					attributes: ['id'],
				}
			)
			const userSessionIds = userSessionData.map(({ id }) => id)
			await userSessionsService.removeUserSessions(userSessionIds)

			//code for remove user folder from cloud

			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'USER_DELETED_SUCCESSFULLY',
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	/**
	 * create admin users
	 * @method
	 * @name create
	 * @param {Object} bodyData - user create information
	 * @param {string} bodyData.email - email.
	 * @param {string} bodyData.password - email.
	 * @returns {JSON} - returns created user information
	 */
	static async create(bodyData) {
		try {
			const plaintextEmailId = bodyData.email.toLowerCase()
			const encryptedEmailId = emailEncryption.encrypt(plaintextEmailId)
			const user = await UserCredentialQueries.findOne({ email: encryptedEmailId })

			if (user) {
				return responses.failureResponse({
					message: 'ADMIN_USER_ALREADY_EXISTS',
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
				})
			}

			let role = await roleQueries.findOne({ title: common.ADMIN_ROLE })
			if (!role) {
				return responses.failureResponse({
					message: 'ROLE_NOT_FOUND',
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
				})
			}

			bodyData.roles = [role.id]

			if (!bodyData.organization_id) {
				let organization = await organizationQueries.findOne(
					{ code: process.env.DEFAULT_ORGANISATION_CODE },
					{ attributes: ['id'] }
				)
				bodyData.organization_id = organization.id
			}
			bodyData.password = utils.hashPassword(bodyData.password)
			bodyData.email = encryptedEmailId
			const createdUser = await userQueries.create(bodyData)
			const userCredentialsBody = {
				email: bodyData.email,
				password: bodyData.password,
				organization_id: createdUser.organization_id,
				user_id: createdUser.id,
			}
			const userData = await UserCredentialQueries.create(userCredentialsBody)
			if (!userData?.id) {
				return responses.failureResponse({
					message: userData,
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
				})
			}
			return responses.successResponse({
				statusCode: httpStatusCode.created,
				message: 'USER_CREATED_SUCCESSFULLY',
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	/**
	 * login admin user
	 * @method
	 * @name login
	 * @param {Object} bodyData - user login data.
	 * @param {string} bodyData.email - email.
	 * @param {string} bodyData.password - email.
	 * @param {string} deviceInformation - device information.
	 * @returns {JSON} - returns login response
	 */
	static async login(bodyData, deviceInformation) {
		try {
			const plaintextEmailId = bodyData.email.toLowerCase()
			const encryptedEmailId = emailEncryption.encrypt(plaintextEmailId)
			const userCredentials = await UserCredentialQueries.findOne({ email: encryptedEmailId })
			if (!userCredentials) {
				return responses.failureResponse({
					message: 'USER_DOESNOT_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			let user = await userQueries.findOne({
				id: userCredentials.user_id,
				organization_id: userCredentials.organization_id,
			})
			if (!user) {
				return responses.failureResponse({
					message: 'USER_DOESNOT_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			const isPasswordCorrect = utils.comparePassword(bodyData.password, userCredentials.password)
			if (!isPasswordCorrect) {
				return responses.failureResponse({
					message: 'USERNAME_OR_PASSWORD_IS_INVALID',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			let roles = await roleQueries.findAll(
				{ id: user.roles },
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

			// create user session entry and add session_id to token data
			const userSessionDetails = await userSessionsService.createUserSession(
				user.id, // userid
				'', // refresh token
				'', // Access token
				deviceInformation
			)

			const tokenDetail = {
				data: {
					id: user.id,
					name: user.name,
					session_id: userSessionDetails.result.id,
					organization_id: user.organization_id,
					roles: roles,
				},
			}

			user.user_roles = roles

			const accessToken = utils.generateToken(
				tokenDetail,
				process.env.ACCESS_TOKEN_SECRET,
				common.accessTokenExpiry
			)
			const refreshToken = utils.generateToken(
				tokenDetail,
				process.env.REFRESH_TOKEN_SECRET,
				common.refreshTokenExpiry
			)

			/**
			 * This function call will do below things
			 * 1: create redis entry for the session
			 * 2: update user-session with token and refresh_token
			 */
			await userSessionsService.updateUserSessionAndsetRedisData(
				userSessionDetails.result.id,
				accessToken,
				refreshToken
			)

			delete user.password
			const result = { access_token: accessToken, refresh_token: refreshToken, user }

			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'LOGGED_IN_SUCCESSFULLY',
				result,
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	/**
	 * Add admin to organization
	 * @method
	 * @name addOrgAdmin
	 * @param {string} userId - user Id.
	 * @param {string} organizationId -organization Id.
	 * @returns {JSON} - delete user response
	 */
	static async addOrgAdmin(userId, organizationId, loggedInUserId, emailId) {
		try {
			let userCredentials
			if (emailId) {
				const plaintextEmailId = emailId.toLowerCase()
				const encryptedEmailId = emailEncryption.encrypt(plaintextEmailId)
				userCredentials = await UserCredentialQueries.findOne({
					email: encryptedEmailId,
				})
			} else {
				userCredentials = await UserCredentialQueries.findOne({
					user_id: userId,
				})
			}

			if (!userCredentials?.id) {
				return responses.failureResponse({
					message: 'USER_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const user = await userQueries.findOne({
				id: userCredentials.user_id,
				organization_id: userCredentials.organization_id,
			})
			if (!user?.id) {
				return responses.failureResponse({
					message: 'USER_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			userId = user.id //un-necessary

			let organization = await organizationQueries.findByPk(organizationId)
			if (!organization?.id) {
				return responses.failureResponse({
					message: 'ORGANIZATION_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const userOrg = await organizationQueries.findByPk(user.organization_id)
			if (!userOrg) {
				return responses.failureResponse({
					message: 'ORGANIZATION_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			// Create a unique array of organization administrators (orgAdmins) by combining the existing
			// organization admins (organization.org_admin) with the userId. The lodash uniq function ensures
			// that the resulting array contains only unique values.
			const orgAdmins = _.uniq([...(organization.org_admin || []), userId])

			const orgRowsAffected = await organizationQueries.update(
				{ id: organizationId },
				{
					org_admin: orgAdmins,
					updated_by: loggedInUserId,
				}
			)
			if (orgRowsAffected == 0) {
				return responses.failureResponse({
					message: 'ORG_ADMIN_MAPPING_FAILED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			let role = await roleQueries.findOne({ title: common.ORG_ADMIN_ROLE }, { attributes: ['id'] })
			if (!role?.id) {
				return responses.failureResponse({
					message: 'ROLE_NOT_FOUND',
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const roles = _.uniq([...(user.roles || []), role.id])

			if (userOrg.code != process.env.DEFAULT_ORGANISATION_CODE && userOrg.id != organizationId) {
				return responses.failureResponse({
					message: 'FAILED_TO_ASSIGN_AS_ADMIN',
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
				})
			}

			//update organization
			if (userOrg.id != organizationId) {
				await userQueries.changeOrganization(userId, userOrg.id, organizationId, {
					//organization_id: organizationId,
					roles: roles,
				})
			} else {
				await userQueries.updateUser(
					{ id: userId, organization_id: userCredentials.organization_id },
					{ roles: roles }
				)
			}

			await UserCredentialQueries.updateUser(
				{
					email: userCredentials.email,
				},
				{ organization_id: organizationId }
			)
			//delete from cache
			const redisUserKey = common.redisUserPrefix + userId.toString()
			await utils.redisDel(redisUserKey)

			const roleData = await roleQueries.findAll(
				{ id: roles, status: common.ACTIVE_STATUS },
				{
					attributes: {
						exclude: ['created_at', 'updated_at', 'deleted_at'],
					},
				}
			)

			// update organization in mentoring
			eventBroadcaster('updateOrganization', {
				requestBody: {
					user_id: userId,
					organization_id: organizationId,
					roles: _.map(roleData, 'title'),
				},
			})

			const result = {
				user_id: userId,
				organization_id: organizationId,
				user_roles: roleData,
			}

			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'ORG_ADMIN_MAPPED_SUCCESSFULLY',
				result,
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	/**
	 * Deactivate Organization
	 * @method
	 * @name deactivateOrg
	 * @param {Number} id - org id
	 * @param {Object} loggedInUserId - logged in user id
	 * @returns {JSON} - Deactivated user count
	 */
	static async deactivateOrg(id, loggedInUserId) {
		try {
			//deactivate org
			let rowsAffected = await organizationQueries.update(
				{
					id,
				},
				{
					status: common.INACTIVE_STATUS,
					updated_by: loggedInUserId,
				}
			)

			if (rowsAffected == 0) {
				return responses.failureResponse({
					message: 'STATUS_UPDATE_FAILED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			//deactivate all users in org
			const [modifiedCount] = await userQueries.updateUser(
				{
					organization_id: id,
				},
				{
					status: common.INACTIVE_STATUS,
					updated_by: loggedInUserId,
				}
			)

			const users = await userQueries.findAll(
				{
					organization_id: id,
				},
				{
					attributes: ['id'],
				}
			)

			const userIds = _.map(users, 'id')
			eventBroadcaster('deactivateUpcomingSession', {
				requestBody: {
					user_ids: userIds,
				},
			})

			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'ORG_DEACTIVATED',
				result: {
					deactivated_users: modifiedCount,
				},
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	/**
	 * Deactivate User
	 * @method
	 * @name deactivateUser
	 * @param {Number} id - user id
	 * @param {Object} loggedInUserId - logged in user id
	 * @returns {JSON} - Deactivated user data
	 */
	static async deactivateUser(bodyData, loggedInUserId) {
		try {
			let filterQuery = {}
			for (let item in bodyData) {
				filterQuery[item] = {
					[Op.in]: bodyData[item],
				}
			}

			let userIds = []

			if (bodyData.email) {
				const encryptedEmailIds = bodyData.email.map((email) => emailEncryption.encrypt(email.toLowerCase()))
				const userCredentials = await UserCredentialQueries.findAll(
					{ email: { [Op.in]: encryptedEmailIds } },
					{
						attributes: ['user_id'],
					}
				)
				userIds = _.map(userCredentials, 'user_id')
				delete filterQuery.email
				filterQuery.id = userIds
			} else {
				userIds = bodyData.id
			}

			let [rowsAffected] = await userQueries.updateUser(filterQuery, {
				status: common.INACTIVE_STATUS,
				updated_by: loggedInUserId,
			})

			if (rowsAffected == 0) {
				return responses.failureResponse({
					message: 'STATUS_UPDATE_FAILED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			//check and deactivate upcoming sessions
			eventBroadcaster('deactivateUpcomingSession', {
				requestBody: {
					user_ids: userIds,
				},
			})

			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'USER_DEACTIVATED',
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	static async triggerViewRebuild(decodedToken) {
		try {
			const result = await adminService.triggerViewBuild()
			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'MATERIALIZED_VIEW_GENERATED_SUCCESSFULLY',
			})
		} catch (error) {
			console.error('An error occurred in userDelete:', error)
			return error
		}
	}
	static async triggerPeriodicViewRefresh(decodedToken) {
		try {
			const result = await adminService.triggerPeriodicViewRefresh()
			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'MATERIALIZED_VIEW_REFRESH_INITIATED_SUCCESSFULLY',
			})
		} catch (error) {
			console.error('An error occurred in userDelete:', error)
			return error
		}
	}
	static async triggerPeriodicViewRefreshInternal(modelName) {
		try {
			const result = await adminService.refreshMaterializedView(modelName)
			console.log(result)
			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'MATERIALIZED_VIEW_REFRESH_INITIATED_SUCCESSFULLY',
			})
		} catch (error) {
			console.error('An error occurred in userDelete:', error)
			return error
		}
	}
}

function _removeUserKeys() {
	let removedFields = ['about', 'share_link', 'preferred_language', 'location', 'languages', 'image', 'roles']
	return removedFields
}

function _generateUpdateParams(userId) {
	const updateUser = {
		deleted_at: new Date(),
		name: 'Anonymous User',
		email: utils.md5Hash(userId) + '@' + 'deletedUser',
		refresh_tokens: [],
		preferred_language: 'en',
		location: '',
		languages: [],
		roles: [],
		status: common.DELETED_STATUS,
	}
	return updateUser
}
