/**
 * name : admin.js
 * author : Priyanka Pradeep
 * created-date : 16-Jun-2023
 * Description : Admin Service Helper.
 */

// Dependencies
// Third-party libraries
const _ = require('lodash')
const { Op } = require('sequelize')

// Constants and generics
const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')
const utils = require('@generics/utils')

// Database queries
const organizationQueries = require('@database/queries/organization')
const roleQueries = require('@database/queries/user-role')
const tenantQueries = require('@database/queries/tenants')
const UserCredentialQueries = require('@database/queries/userCredential')
const userOrganizationQueries = require('@database/queries/userOrganization')
const userOrganizationRoleQueries = require('@database/queries/userOrganizationRole')
const userQueries = require('@database/queries/users')
const { sequelize } = require('@database/models/index')

// Services
const adminService = require('../generics/materializedViews')
const userSessionsService = require('@services/user-sessions')

// Helpers and utilities
const { broadcastUserEvent } = require('@helpers/eventBroadcasterMain')
const emailEncryption = require('@utils/emailEncryption')
const { eventBroadcaster } = require('@helpers/eventBroadcaster')
const { generateUniqueUsername } = require('@utils/usernameGenerator')
const responses = require('@helpers/responses')
const userHelper = require('@helpers/userHelper')

// DTOs
const UserTransformDTO = require('@dtos/userDTO')

module.exports = class AdminHelper {
	/**
	 * Delete User
	 * @method
	 * @name deleteUser
	 * @param {string} userId -delete user Id.
	 * @returns {JSON} - delete user response
	 */
	static async deleteUser(userId, adminUserId) {
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
			const eventBody = UserTransformDTO.deleteEventBodyDTO({
				entity: 'user',
				eventType: 'delete',
				entityId: userId,
				args: {
					created_by: adminUserId,
					created_at: user?.created_at,
					updated_at: user?.updated_at,
					deleted_at: new Date(),
					tenant_code: user?.tenant_code,
					status: 'DELETED',
					deleted: true,
					id: userId,
					username: user?.username || null,
					email: user?.email ? emailEncryption.decrypt(user?.email) : user?.email || null,
					phone: user?.phone ? emailEncryption.decrypt(user?.phone) : user?.phone || null,
				},
			})

			broadcastUserEvent('userEvents', { requestBody: eventBody, isInternal: true })

			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: result.message,
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * Creates a new admin user.
	 *
	 * @async
	 * @method
	 * @name create
	 * @param {Object} bodyData - Data for creating the user.
	 * @param {string} bodyData.email - Email of the user.
	 * @param {string} bodyData.password - Password for the user account.
	 * @param {string} [bodyData.username] - Optional username (generated if not provided).
	 * @param {string} [bodyData.name] - Optional name (used for username generation if username not provided).
	 * @returns {Promise<Object>} - Response containing the created user data or error.
	 *
	 * @throws {Error} If default tenant or organization is not found or if creation fails.
	 */

	static async create(bodyData) {
		let transaction

		try {
			transaction = await sequelize.transaction()

			const plaintextEmailId = bodyData.email.toLowerCase()
			const encryptedEmailId = emailEncryption.encrypt(plaintextEmailId)

			// Get default tenant details
			const tenantDetail = await tenantQueries.findOne({
				code: process.env.DEFAULT_TENANT_CODE,
				status: common.ACTIVE_STATUS,
			})
			if (!tenantDetail) throw new Error('DEFAULT_TENANT_NOT_FOUND')

			const existingUser = await userQueries.findOne(
				{
					email: encryptedEmailId,
					password: { [Op.ne]: null },
					tenant_code: tenantDetail.code,
				},
				{ attributes: ['id'], transaction }
			)
			if (existingUser) throw new Error('ADMIN_USER_ALREADY_EXISTS')

			const role = await roleQueries.findOne(
				{
					title: common.ADMIN_ROLE,
					tenant_code: tenantDetail.code,
				},
				{ transaction }
			)
			if (!role) throw new Error('ADMIN_ROLE_NOT_FOUND')

			const defaultOrganizationCode = process.env.DEFAULT_ORGANISATION_CODE

			// Prepare user data
			bodyData.email = encryptedEmailId
			bodyData.password = utils.hashPassword(bodyData.password)
			bodyData.tenant_code = tenantDetail.code
			bodyData.roles = [role.id]

			// Generate username if not provided
			if (!bodyData.username) {
				bodyData.username = await generateUniqueUsername(bodyData.name)
			}

			// Create user
			const createdUser = await userQueries.create(bodyData, { transaction })

			// Create user-organization relationship
			await userOrganizationQueries.create(
				{
					user_id: createdUser.id,
					organization_code: defaultOrganizationCode,
					tenant_code: tenantDetail.code,
				},
				{ transaction }
			)

			// Create user-organization-role relationship
			await userOrganizationRoleQueries.create(
				{
					tenant_code: tenantDetail.code,
					user_id: createdUser.id,
					organization_code: defaultOrganizationCode,
					role_id: role.id,
				},
				{ transaction }
			)

			await transaction.commit()

			const user = await userQueries.findUserWithOrganization(
				{ id: createdUser.id, tenant_code: tenantDetail.code },
				{ attributes: { exclude: ['password'] } }
			)

			const processedUser = { ...user, email: plaintextEmailId }

			const eventBody = UserTransformDTO.eventBodyDTO({
				entity: 'user',
				eventType: 'create',
				entityId: processedUser.id,
				args: {
					...processedUser,
					created_by: processedUser.id,
					deleted: false,
					created_at: processedUser?.created_at || new Date(),
					updated_at: processedUser?.updated_at || new Date(),
				},
			})

			broadcastUserEvent('userEvents', { requestBody: eventBody, isInternal: true })

			return responses.successResponse({
				statusCode: httpStatusCode.created,
				message: 'ADMIN_USER_CREATED_SUCCESSFULLY',
				result: { user: processedUser },
			})
		} catch (error) {
			if (transaction && !transaction.finished) {
				try {
					await transaction.rollback()
				} catch (rollbackErr) {
					console.error('Rollback failed:', rollbackErr)
				}
			}

			switch (error.message) {
				case 'DEFAULT_TENANT_NOT_FOUND':
				case 'ADMIN_USER_ALREADY_EXISTS':
				case 'ADMIN_ROLE_NOT_FOUND':
					return responses.failureResponse({
						message: error.message,
						statusCode: httpStatusCode.not_acceptable,
						responseCode: 'CLIENT_ERROR',
					})
				default:
					console.error('Unexpected error in admin.create:', error)
					throw error
			}
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
	 * Deactivate an organization and all its associated users.
	 *
	 * This method:
	 * 1. Updates the organization's status to inactive.
	 * 2. Deactivates all users belonging to the organization.
	 * 3. Ends all active sessions for the deactivated users.
	 * 4. Broadcasts an event to end any upcoming sessions.
	 *
	 * @async
	 * @function deactivateOrg
	 * @param {string} organizationCode - The unique code identifying the organization.
	 * @param {string} tenantCode - The tenant code to which the organization belongs.
	 * @param {number} loggedInUserId - The ID of the user performing the deactivation.
	 * @returns {Promise<Object>} Success or failure response object containing:
	 *  - {number} result.deactivated_users - The number of users deactivated.
	 *
	 * @throws {Error} Will throw an error if the organization status update fails or if a database error occurs.
	 */

	static async deactivateOrg(organizationCode, tenantCode, loggedInUserId) {
		try {
			// 1. Deactivate org
			const orgRowsAffected = await organizationQueries.update(
				{
					code: organizationCode,
					tenant_code: tenantCode,
				},
				{
					status: common.INACTIVE_STATUS,
					updated_by: loggedInUserId,
				}
			)

			if (orgRowsAffected === 0) {
				return responses.failureResponse({
					message: 'STATUS_UPDATE_FAILED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			// 2. Deactivate all users in the org using the same helper as deactivateUser
			const [userRowsAffected, updatedUsers] = await userQueries.deactivateUserInOrg(
				{
					tenant_code: tenantCode,
				},
				organizationCode,
				tenantCode,
				{
					status: common.INACTIVE_STATUS,
					updated_by: loggedInUserId,
				},
				true // so we can get the user IDs
			)

			// 3. Broadcast & remove sessions if users were found
			if (userRowsAffected > 0) {
				const userIds = updatedUsers.map((u) => u.id)

				// End all active sessions for those users
				await userHelper.removeAllUserSessions(userIds, tenantCode)

				// Broadcast to end upcoming sessions
				eventBroadcaster('deactivateUpcomingSession', {
					requestBody: { user_ids: userIds },
				})
			}

			// 4. Return success
			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'ORG_DEACTIVATED',
				result: {
					deactivated_users: userRowsAffected,
				},
			})
		} catch (error) {
			console.error('Error in deactivateOrg:', error)
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
