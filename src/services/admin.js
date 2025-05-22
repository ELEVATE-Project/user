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
const userOrganizationQueries = require('@database/queries/userOrganization')
const userOrganizationRoleQueries = require('@database/queries/userOrganizationRole')
const { eventBroadcaster } = require('@helpers/eventBroadcaster')
const { Op } = require('sequelize')
const Sequelize = require('@database/models/index').sequelize
const UserCredentialQueries = require('@database/queries/userCredential')
const adminService = require('../generics/materializedViews')
const emailEncryption = require('@utils/emailEncryption')
const responses = require('@helpers/responses')
const userSessionsService = require('@services/user-sessions')
const userHelper = require('@helpers/userHelper')

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
			const result = await userHelper.deleteUser(userId, user)
			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: result.message,
			})
		} catch (error) {
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
			bodyData.organization_id = process.env.DEFAULT_ORG_ID
			bodyData.tenant_code = process.env.DEFAULT_TENANT_CODE

			// if (!bodyData.organization_id) {
			// 	let organization = await organizationQueries.findOne(
			// 		{ code: process.env.DEFAULT_ORGANISATION_CODE },
			// 		{ attributes: ['id'] }
			// 	)
			// 	bodyData.organization_id = organization.id
			// }
			bodyData.password = utils.hashPassword(bodyData.password)
			bodyData.email = encryptedEmailId
			const createdUser = await userQueries.create(bodyData)
			const userCredentialsBody = {
				email: bodyData.email,
				password: bodyData.password,
				organization_id: process.env.DEFAULT_ORG_ID,
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
				// organization_id: userCredentials.organization_id,
			})
			if (!user.id) {
				return responses.failureResponse({
					message: 'USER_DOESNOT_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			const isPasswordCorrect = utils.comparePassword(bodyData.password, user.password)
			if (!isPasswordCorrect) {
				return responses.failureResponse({
					message: 'PASSWORD_INVALID',
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

			/**
			 * Based on user organisation id get user org parent Id value
			 * If parent org id is present then set it to tenant of user
			 * if not then set user organisation id to tenant
			 */

			// let tenantDetails = await organizationQueries.findOne(
			// 	{ id: user.organization_id },
			// 	{ attributes: ['parent_id'] }
			// )

			// const tenant_id =
			// 	tenantDetails && tenantDetails.parent_id !== null ? tenantDetails.parent_id : user.organization_id

			const tokenDetail = {
				data: {
					id: user.id,
					name: user.name,
					session_id: userSessionDetails.result.id,
					organizations: [
						{
							id: process.env.DEFAULT_ORG_ID,
							roles: roles,
						},
					],
					tenant_code: process.env.DEFAULT_TENANT_CODE,
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
	 * @param {string} userId - User ID.
	 * @param {string} organizationId - Organization ID.
	 * @param {string} loggedInUserId - ID of the logged-in user.
	 * @param {string} identifier - User identifier (email, phone, or username).
	 * @param {string} tenantCode - Tenant code.
	 * @param {string} [phoneCode] - Phone code (required for phone identifier).
	 * @returns {Promise<JSON>} - Response with success or failure details.
	 */
	static async addOrgAdmin(userId, organizationId, loggedInUserId, identifier, tenantCode, phoneCode) {
		try {
			// Helper functions for identifier validation
			const isEmail = (str) => /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(str)
			const isPhone = (str) => /^\+?[1-9]\d{1,14}$/.test(str)
			const isUsername = (str) => /^[a-zA-Z0-9_]{3,30}$/.test(str)

			let user

			// Try finding user by userId if provided
			if (userId) {
				user = await userQueries.findUserWithOrganization(
					{
						id: userId,
						tenant_code: tenantCode,
						status: common.ACTIVE_STATUS,
						password: { [Op.ne]: null },
					},
					{},
					false
				)
			}

			// If user not found by userId, try finding by identifier
			if (!user?.id && identifier?.trim()) {
				const normalizedIdentifier = identifier.trim().toLowerCase()
				const query = {
					[Op.or]: [],
					tenant_code: tenantCode,
					status: common.ACTIVE_STATUS,
					password: { [Op.ne]: null },
				}

				if (isEmail(normalizedIdentifier)) {
					query[Op.or].push({ email: emailEncryption.encrypt(normalizedIdentifier) })
				} else if (isPhone(normalizedIdentifier)) {
					if (!phoneCode) {
						return responses.failureResponse({
							message: 'PHONE_CODE_REQUIRED',
							statusCode: httpStatusCode.bad_request,
							responseCode: 'CLIENT_ERROR',
						})
					}
					query[Op.or].push({ phone: emailEncryption.encrypt(normalizedIdentifier), phone_code: phoneCode })
				} else if (isUsername(normalizedIdentifier)) {
					query[Op.or].push({ username: normalizedIdentifier })
				} else {
					return responses.failureResponse({
						message: 'INVALID_IDENTIFIER',
						statusCode: httpStatusCode.bad_request,
						responseCode: 'CLIENT_ERROR',
					})
				}

				user = await userQueries.findUserWithOrganization(query, {}, false)
			}

			// Check if user was found
			if (!user?.id) {
				return responses.failureResponse({
					message: 'USER_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			// Fetch organization
			const organization = await organizationQueries.findByPk(organizationId)
			if (!organization?.id) {
				return responses.failureResponse({
					message: 'ORGANIZATION_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			// Check if user is already an admin
			const orgAdmins = new Set(organization.org_admin || [])
			if (orgAdmins.has(user.id)) {
				return responses.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'USER_ALREADY_ORG_ADMIN',
					result: { user_id: user.id, organization_id: organizationId },
				})
			}

			// Update organization admins
			orgAdmins.add(user.id)
			const orgRowsAffected = await organizationQueries.update(
				{ id: organizationId },
				{
					org_admin: [...orgAdmins],
					updated_by: loggedInUserId,
				}
			)

			if (orgRowsAffected === 0) {
				return responses.failureResponse({
					message: 'ORG_ADMIN_MAPPING_FAILED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			// Fetch or validate org admin role
			const role = await roleQueries.findOne(
				{ title: common.ORG_ADMIN_ROLE, tenant_code: tenantCode },
				{ attributes: ['id'] }
			)

			if (!role?.id) {
				return responses.failureResponse({
					message: 'ROLE_NOT_FOUND',
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
				})
			}

			// Check user organization membership
			const isUserInDefaultOrg = user.organizations.some(
				(org) => org.code === process.env.DEFAULT_ORGANISATION_CODE
			)
			const isUserInOrg = user.organizations.some((org) => org.id === organizationId)

			if (!isUserInDefaultOrg && !isUserInOrg) {
				return responses.failureResponse({
					message: 'FAILED_TO_ASSIGN_AS_ADMIN',
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
				})
			}

			// Assign role and update organization if needed
			if (!isUserInOrg) {
				await userOrganizationQueries.changeUserOrganization({
					userId: user.id,
					tenantCode,
					oldOrgCode: process.env.DEFAULT_ORGANISATION_CODE,
					newOrgCode: organization.code,
				})
			}

			await userOrganizationRoleQueries.create({
				tenant_code: tenantCode,
				user_id: user.id,
				organization_code: organization.code,
				role_id: role.id,
			})

			// Clear cache
			const redisUserKey = `${common.redisUserPrefix}${tenantCode}_${user.id}`
			await utils.redisDel(redisUserKey)

			// Fetch updated roles
			const userRoles = new Set(user.roles || [])
			userRoles.add(role.id)
			const roleData = await roleQueries.findAll(
				{ id: [...userRoles], status: common.ACTIVE_STATUS },
				{ attributes: { exclude: ['created_at', 'updated_at', 'deleted_at'] } }
			)

			// Broadcast event asynchronously
			setImmediate(() =>
				eventBroadcaster('updateOrganization', {
					requestBody: {
						user_id: user.id,
						organization_id: organizationId,
						roles: roleData.map((r) => r.title),
					},
				})
			)

			// Prepare response
			const result = {
				user_id: user.id,
				organization_id: organizationId,
				user_roles: roleData,
			}

			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'ORG_ADMIN_MAPPED_SUCCESSFULLY',
				result,
			})
		} catch (error) {
			console.error('Error in addOrgAdmin:', { error, userId, organizationId, tenantCode })
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
