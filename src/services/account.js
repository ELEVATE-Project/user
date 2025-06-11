/**
 * name : account.js
 * author : Aman Gupta
 * created-date : 03-Nov-2021
 * Description : account helper.
 */

// Dependencies
const bcryptJs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const _ = require('lodash')

const utilsHelper = require('@generics/utils')
const httpStatusCode = require('@generics/http-status')

const common = require('@constants/common')
const userQueries = require('@database/queries/users')
const organizationQueries = require('@database/queries/organization')
const notificationTemplateQueries = require('@database/queries/notificationTemplate')
const kafkaCommunication = require('@generics/kafka-communication')
const roleQueries = require('@database/queries/user-role')
const orgDomainQueries = require('@database/queries/orgDomain')
const userInviteQueries = require('@database/queries/orgUserInvite')
const entityTypeQueries = require('@database/queries/entityType')
const utils = require('@generics/utils')
const { Op } = require('sequelize')
const { removeDefaultOrgEntityTypes } = require('@generics/utils')
const UserCredentialQueries = require('@database/queries/userCredential')
const emailEncryption = require('@utils/emailEncryption')
const responses = require('@helpers/responses')
const userSessionsService = require('@services/user-sessions')

const tenantDomainQueries = require('@database/queries/tenantDomain')
const tenantQueries = require('@database/queries/tenants')
const userOrganizationQueries = require('@database/queries/userOrganization')
const userOrganizationRoleQueries = require('@database/queries/userOrganizationRole')
const { generateUniqueUsername } = require('@utils/usernameGenerator.js')
const UserTransformDTO = require('@dtos/userDTO')
const notificationUtils = require('@utils/notification')
const userHelper = require('@helpers/userHelper')
const { broadcastUserEvent } = require('@helpers/eventBroadcasterMain')

module.exports = class AccountHelper {
	/**
	 * create account
	 * @method
	 * @name create
	 * @param {Object} bodyData -request body contains user creation deatils.
	 * @param {String} bodyData.name - name of the user.
	 * @param {Boolean} bodyData.isAMentor - is a mentor or not .
	 * @param {String} bodyData.email - user email.
	 * @param {String} bodyData.password - user password.
	 * @param {Object} deviceInfo - Device information
	 * @returns {JSON} - returns account creation details.
	 */

	static async create(bodyData, deviceInfo, domain) {
		const projection = ['password']

		try {
			const notFoundResponse = (message) =>
				responses.failureResponse({
					message,
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
				})

			const tenantDomain = await tenantDomainQueries.findOne({ domain })
			if (!tenantDomain) {
				return notFoundResponse('TENANT_DOMAIN_NOT_FOUND_PING_ADMIN')
			}

			const tenantDetail = await tenantQueries.findOne({
				code: tenantDomain.tenant_code,
				status: common.ACTIVE_STATUS,
			})
			if (!tenantDetail) {
				return notFoundResponse('TENANT_NOT_FOUND_PING_ADMIN')
			}

			if (!bodyData.email && !bodyData.phone) {
				return responses.failureResponse({
					message: 'EMAIL_OR_PHONE_REQUIRED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			let domainDetails = null

			if (bodyData.registration_code) {
				domainDetails = await organizationQueries.findOne({
					tenant_code: tenantDetail.code,
					registration_code: bodyData.registration_code,
				})

				if (!domainDetails) {
					return responses.failureResponse({
						message: 'INVALID_ORG_registration_code',
						statusCode: httpStatusCode.bad_request,
						responseCode: 'CLIENT_ERROR',
					})
				}
			}

			// Handle email encryption if provided
			let encryptedEmailId = null
			let plaintextEmailId = null
			if (bodyData.email) {
				plaintextEmailId = bodyData.email.toLowerCase()
				encryptedEmailId = emailEncryption.encrypt(plaintextEmailId)
				bodyData.email = encryptedEmailId
			}

			// Handle phone encryption if provided
			let encryptedPhoneNumber = null
			let plaintextPhoneNumber = null
			if (bodyData.phone && bodyData.phone_code) {
				plaintextPhoneNumber = bodyData.phone
				encryptedPhoneNumber = emailEncryption.encrypt(plaintextPhoneNumber)
				bodyData.phone = encryptedPhoneNumber
				bodyData.phone_code = bodyData.phone_code // Store phone_code separately
			}

			const criteria = []
			if (encryptedEmailId) criteria.push({ email: encryptedEmailId })
			if (encryptedPhoneNumber) criteria.push({ phone: encryptedPhoneNumber })
			if (bodyData.username) criteria.push({ username: bodyData.username })

			if (criteria.length === 0) {
				return // Skip if no criteria
			}

			// Check if user already exists with email or phone or username
			let user = await userQueries.findOne(
				{
					[Op.or]: criteria,
					password: { [Op.ne]: null },
					tenant_code: tenantDetail.code,
				},
				{
					attributes: ['id'],
				}
			)

			if (user) {
				return responses.failureResponse({
					message: 'USER_ALREADY_EXISTS',
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
				})
			}

			// OTP validation
			if (process.env.ENABLE_EMAIL_OTP_VERIFICATION === 'true') {
				let isOtpValid = false
				const providedOtp = bodyData.otp

				// Check email OTP if email is provided
				if (encryptedEmailId) {
					const emailRedisData = await utilsHelper.redisGet(encryptedEmailId)
					if (emailRedisData && emailRedisData.otp === providedOtp) {
						isOtpValid = true
					}
				}

				// Check phone OTP if phone is provided
				if (encryptedPhoneNumber) {
					const phoneRedisData = await utilsHelper.redisGet(bodyData.phone_code + encryptedPhoneNumber)
					if (phoneRedisData && phoneRedisData.otp === providedOtp) {
						isOtpValid = true
					}
				}

				if (!isOtpValid) {
					return responses.failureResponse({
						message: 'OTP_INVALID',
						statusCode: httpStatusCode.bad_request,
						responseCode: 'CLIENT_ERROR',
					})
				}
			}

			bodyData.password = utilsHelper.hashPassword(bodyData.password)
			if (!bodyData.username) {
				bodyData.username = await generateUniqueUsername(bodyData.name)
			}
			// Check user in invitee list
			let role,
				roles = []
			let invitedUserMatch = false
			let invitedUserId = null

			if (encryptedEmailId) {
				invitedUserId = await UserCredentialQueries.findOne(
					{
						email: encryptedEmailId,
						organization_user_invite_id: {
							[Op.ne]: null,
						},
						password: {
							[Op.eq]: null,
						},
					},
					{ attributes: ['organization_user_invite_id', 'organization_id'], raw: true }
				)
			}
			/* 			if (!invitedUserId && encryptedPhoneNumber) {
				invitedUserId = await UserCredentialQueries.findOne(
					{
						phone: encryptedPhoneNumber,
						organization_user_invite_id: {
							[Op.ne]: null,
						},
						password: {
							[Op.eq]: null,
						},
					},
					{ attributes: ['organization_user_invite_id', 'organization_id'], raw: true }
				)
			} */

			if (invitedUserId) {
				invitedUserMatch = await userInviteQueries.findOne({
					id: invitedUserId.organization_user_invite_id,
					organization_id: invitedUserId.organization_id,
				})
			}

			let isOrgAdmin = false
			if (invitedUserMatch) {
				bodyData.organization_id = invitedUserMatch.organization_id
				roles = invitedUserMatch.roles
				role = await roleQueries.findAll(
					{ id: invitedUserMatch.roles },
					{
						attributes: {
							exclude: ['created_at', 'updated_at', 'deleted_at'],
						},
					}
				)

				if (!role.length > 0) {
					return responses.failureResponse({
						message: 'ROLE_NOT_FOUND',
						statusCode: httpStatusCode.not_acceptable,
						responseCode: 'CLIENT_ERROR',
					})
				}

				const defaultRole = await roleQueries.findAll(
					{
						title: {
							[Op.in]: process.env.DEFAULT_ROLE.split(','),
						},
					},
					{
						attributes: {
							exclude: ['created_at', 'updated_at', 'deleted_at'],
						},
					}
				)

				let defaultRoles = defaultRole.map((userRoles) => {
					return userRoles.id
				})

				let roleTitles = _.map(role, 'title')
				if (!roleTitles.includes(common.MENTOR_ROLE)) {
					roles.push(...defaultRoles)
				}
				if (roleTitles.includes(common.ORG_ADMIN_ROLE)) {
					isOrgAdmin = true
				}

				roles = _.uniq(roles)
				bodyData.roles = roles
			} else {
				//find organization from email domain

				bodyData.tenant_code = tenantDetail.code

				//add default role as mentee
				role = await roleQueries.findAll(
					{
						title: {
							[Op.in]: process.env.DEFAULT_ROLE.split(','),
						},
						tenant_code: tenantDetail.code,
					},
					{
						attributes: {
							exclude: ['created_at', 'updated_at', 'deleted_at'],
						},
					}
				)

				if (!role) {
					return responses.failureResponse({
						message: 'ROLE_NOT_FOUND',
						statusCode: httpStatusCode.not_acceptable,
						responseCode: 'CLIENT_ERROR',
					})
				}

				roles = role.map((userRoles) => {
					return userRoles.id
				})
				bodyData.roles = roles
			}

			delete bodyData.role
			if (encryptedEmailId) bodyData.email = encryptedEmailId
			if (encryptedPhoneNumber) bodyData.phone = encryptedPhoneNumber

			if (!domainDetails) {
				const emailDomain = plaintextEmailId ? utilsHelper.extractDomainFromEmail(plaintextEmailId) : null

				domainDetails = emailDomain
					? await orgDomainQueries.findOne({
							domain: emailDomain,
							tenant_code: tenantDetail.code,
					  })
					: null
			}

			const organizationCode = domainDetails?.code || process.env.DEFAULT_ORGANISATION_CODE

			const [defaultOrg, userOrgDetails, modelName] = await Promise.all([
				organizationQueries.findOne(
					{ code: process.env.DEFAULT_ORGANISATION_CODE, tenant_code: tenantDetail.code },
					{ attributes: ['id'] }
				),
				organizationQueries.findOne(
					{ code: organizationCode, tenant_code: tenantDetail.code },
					{ attributes: ['id'] }
				),
				userQueries.getModelName(),
			])

			if (!defaultOrg || !userOrgDetails) {
				throw new Error('Default or user organization not found.')
			}

			const defaultOrgId = defaultOrg.id
			const userOrgId = userOrgDetails.id

			const [validationData, userModel] = await Promise.all([
				entityTypeQueries.findUserEntityTypesAndEntities({
					status: 'ACTIVE',
					organization_id: { [Op.in]: [userOrgId, defaultOrgId] },
					model_names: { [Op.contains]: [modelName] },
					tenant_code: tenantDetail.code,
				}),
				userQueries.getColumns(),
			])

			const prunedEntities = removeDefaultOrgEntityTypes(validationData, userOrgId)

			let res = utils.validateInput(bodyData, prunedEntities, await userQueries.getModelName())
			if (!res.success) {
				return responses.failureResponse({
					message: 'VALIDATION_FAILED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
					result: res.errors,
				})
			}
			const restructuredData = utils.restructureBody(bodyData, prunedEntities, userModel)
			let metaData = restructuredData?.meta || {}
			const insertedUser = await userQueries.create(restructuredData)

			const userOrg = await userOrganizationQueries.create({
				user_id: insertedUser.id,
				organization_code: organizationCode,
				tenant_code: tenantDetail.code,
			})

			const insertedUserRoles = await Promise.all(
				bodyData.roles.map((roleId) =>
					userOrganizationRoleQueries.create({
						tenant_code: tenantDetail.code,
						user_id: insertedUser.id,
						organization_code: organizationCode,
						role_id: roleId,
					})
				)
			)

			const userCredentialsBody = {
				email: encryptedEmailId,
				//phone: encryptedPhoneNumber,
				//phone_code: bodyData.phone_code,
				password: bodyData.password,
				organization_id: 1,
				user_id: insertedUser.id,
			}
			let userCredentials
			if (invitedUserMatch) {
				userCredentials = await UserCredentialQueries.updateUser(
					{
						email: encryptedEmailId,
					},
					{ user_id: insertedUser.id, password: bodyData.password },
					{
						raw: true,
					}
				)
			} else {
				userCredentials = await UserCredentialQueries.create(userCredentialsBody)
			}
			/* FLOW STARTED: user login after registration */
			user = await userQueries.findUserWithOrganization(
				{ id: insertedUser.id, tenant_code: tenantDetail.code },
				{
					attributes: {
						exclude: projection,
					},
				}
			)

			const roleData = user.organizations[0].roles

			/**
			 * create user session entry and add session_id to token data
			 * Entry should be created first, the session_id has to be added to token creation data
			 */
			const userSessionDetails = await userSessionsService.createUserSession(
				user.id, // userid
				'', // refresh token
				'', // Access token
				deviceInfo
			)

			/**
			 * Based on user organisation id get user org parent Id value
			 * If parent org id is present then set it to tenant of user
			 * if not then set user organisation id to tenant
			 */

			/* 			let tenantDetails = await organizationQueries.findOne(
				{ id: user.organization_id },
				{ attributes: ['related_orgs'] }
			)

			const tenant_id =
				tenantDetails && tenantDetails.parent_id !== null ? tenantDetails.parent_id : user.organization_id */

			const tokenDetail = {
				data: {
					id: user.id,
					name: user.name,
					session_id: userSessionDetails.result.id,
					organization_ids: user.organizations.map((org) => String(org.id)), // Convert to string
					organization_codes: user.organizations.map((org) => String(org.code)), // Convert to string
					tenant_code: tenantDetail.code,
					organizations: user.organizations,
				},
			}

			//	user.user_roles = roleData

			// format the roles for email template
			let roleArray = []
			if (roleData.length > 0) {
				const mentorRoleExists = roleData.some((role) => role.title === common.MENTOR_ROLE)
				roleArray = _.map(roleData, 'title')
				if (mentorRoleExists) {
					_.remove(roleArray, (title) => title === common.MENTEE_ROLE)
				}
			}

			let roleToString =
				roleArray.length > 0
					? roleArray
							.map((role) => role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()))
							.join(' and ')
					: ''

			const accessToken = utilsHelper.generateToken(
				tokenDetail,
				process.env.ACCESS_TOKEN_SECRET,
				common.accessTokenExpiry
			)

			const refreshToken = utilsHelper.generateToken(
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

			// Delete Redis OTP entries
			if (encryptedEmailId) await utilsHelper.redisDel(encryptedEmailId)
			if (encryptedPhoneNumber) await utilsHelper.redisDel(bodyData.phone_code + encryptedPhoneNumber)

			if (isOrgAdmin) {
				let organization = await organizationQueries.findByPk(user.organization_id)
				const orgAdmins = _.uniq([...(organization.org_admin || []), user.id])
				await organizationQueries.update(
					{
						id: user.organization_id,
						tenant_code: tenantDetail.code,
					},
					{
						org_admin: orgAdmins,
					}
				)
			}

			const result = { access_token: accessToken, refresh_token: refreshToken, user }
			const templateData = await notificationTemplateQueries.findOneEmailTemplate(
				process.env.REGISTRATION_EMAIL_TEMPLATE_CODE,
				user.organization_id
			)

			if (plaintextEmailId) {
				notificationUtils.sendEmailNotification({
					emailId: plaintextEmailId,
					templateCode: process.env.REGISTRATION_EMAIL_TEMPLATE_CODE,
					variables: {
						name: bodyData.name,
						appName: tenantDetail.name,
						roles: roleToString || '',
						portalURL: tenantDomain.domain,
					},
					tenantCode: tenantDetail.code,
				})
			}

			// Send SMS notification with OTP if phone is provided
			if (plaintextPhoneNumber) {
				notificationUtils.sendSMSNotification({
					phoneNumber: plaintextPhoneNumber,
					templateCode: process.env.REGISTRATION_EMAIL_TEMPLATE_CODE,
					variables: {
						name: bodyData.name,
						appName: tenantDetail.name,
						roles: roleToString || '',
						portalURL: tenantDomain.domain,
					},
					tenantCode: tenantDetail.code,
				})
			}
			result.user = await utils.processDbResponse(result.user, prunedEntities)
			result.user.email = plaintextEmailId
			result.user.phone = plaintextPhoneNumber
			result.user.phone_code = bodyData.phone_code
			metaData = Object.fromEntries(
				Object.keys(metaData).map((metaKey) => [metaKey, result?.user?.[metaKey] ?? {}])
			)
			const eventBody = UserTransformDTO.eventBodyDTO({
				entity: 'user',
				eventType: 'create',
				entityId: result.user?.id,
				args: {
					created_by: result.user.id,
					name: result.user?.name,
					username: result.user?.username,
					email: result.user.email,
					phone: result.user?.phone,
					organizations: result.user?.organizations,
					tenant_code: result.user?.tenant_code,
					...metaData,
					status: insertedUser?.status || common.ACTIVE_STATUS,
					deleted: false,
					id: result.user.id,
				},
			})

			broadcastUserEvent('userEvents', { requestBody: eventBody, isInternal: true })

			return responses.successResponse({
				statusCode: httpStatusCode.created,
				message: 'USER_CREATED_SUCCESSFULLY',
				result,
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	/**
	 * login user account
	 * @method
	 * @name login
	 * @param {Object} bodyData -request body contains user login deatils.
	 * @param {String} bodyData.email - user email.
	 * @param {String} bodyData.password - user password.
	 * @param {Object} deviceInformation - device information
	 * @returns {JSON} - returns susccess or failure of login details.
	 */

	static async login(bodyData, deviceInformation, domain) {
		try {
			const notFoundResponse = (message) =>
				responses.failureResponse({
					message,
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
				})

			// Validate tenant domain
			const tenantDomain = await tenantDomainQueries.findOne({ domain })
			if (!tenantDomain) {
				return notFoundResponse('TENANT_DOMAIN_NOT_FOUND_PING_ADMIN')
			}

			// Validate tenant
			const tenantDetail = await tenantQueries.findOne({
				code: tenantDomain.tenant_code,
			})
			if (!tenantDetail) {
				return notFoundResponse('TENANT_NOT_FOUND_PING_ADMIN')
			}

			// Helper functions to detect identifier type
			const isEmail = (str) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(str)
			const isPhone = (str) => /^\+?[1-9]\d{1,14}$/.test(str) // Adjust regex as needed
			const isUsername = (str) => /^[a-zA-Z0-9_]{3,30}$/.test(str)

			const identifier = bodyData.identifier?.toLowerCase()
			if (!identifier) {
				return responses.failureResponse({
					message: 'IDENTIFIER_REQUIRED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			// Prepare query based on identifier type
			const query = {
				[Op.or]: [],
				password: { [Op.ne]: null },
				status: common.ACTIVE_STATUS,
				tenant_code: tenantDetail.code,
			}

			if (isEmail(identifier)) {
				query[Op.or].push({ email: emailEncryption.encrypt(identifier) })
			} else if (isPhone(identifier)) {
				query[Op.or].push({ phone: emailEncryption.encrypt(identifier), phone_code: bodyData.phone_code }) // Adjust if phone encryption differs
			} else {
				query[Op.or].push({ username: identifier })
			}
			// Find user
			const userInstance = await userQueries.findUserWithOrganization(query, {}, true)
			let user = userInstance ? userInstance.toJSON() : null

			if (!user) {
				return responses.failureResponse({
					message: 'IDENTIFIER_OR_PASSWORD_INVALID',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			// Check active session limit
			if (process.env.ALLOWED_ACTIVE_SESSIONS != null) {
				const activeSessionCount = await userSessionsService.activeUserSessionCounts(user.id)
				if (activeSessionCount >= process.env.ALLOWED_ACTIVE_SESSIONS) {
					return responses.failureResponse({
						message: 'ACTIVE_SESSION_LIMIT_EXCEEDED',
						statusCode: httpStatusCode.not_acceptable,
						responseCode: 'CLIENT_ERROR',
					})
				}
			}

			// Verify password
			const isPasswordCorrect = bcryptJs.compareSync(bodyData.password, user.password)
			if (!isPasswordCorrect) {
				return responses.failureResponse({
					message: 'IDENTIFIER_OR_PASSWORD_INVALID',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			// Create user session
			const userSessionDetails = await userSessionsService.createUserSession(user.id, '', '', deviceInformation)

			// Determine tenant ID
			/* 			let tenantDetails = await organizationQueries.findOne(
				{ id: user.organization_id },
				{ attributes: ['related_orgs'] }
			)
			const tenant_id =
				tenantDetails && tenantDetails.parent_id !== null ? tenantDetails.parent_id : user.organization_id
 */
			// Transform user data
			user = UserTransformDTO.transform(user)
			const tokenDetail = {
				data: {
					id: user.id,
					name: user.name,
					session_id: userSessionDetails.result.id,
					organization_ids: user.organizations.map((org) => String(org.id)), // Convert to string
					organization_codes: user.organizations.map((org) => String(org.code)), // Convert to string					// tenant_id: tenant_id,
					tenant_code: tenantDetail.code,
					organizations: user.organizations,
				},
			}

			// Generate tokens
			const accessToken = utilsHelper.generateToken(
				tokenDetail,
				process.env.ACCESS_TOKEN_SECRET,
				common.accessTokenExpiry
			)
			const refreshToken = utilsHelper.generateToken(
				tokenDetail,
				process.env.REFRESH_TOKEN_SECRET,
				common.refreshTokenExpiry
			)

			delete user.password

			// Fetch default organization and validation data
			let defaultOrg = await organizationQueries.findOne(
				{ code: process.env.DEFAULT_ORGANISATION_CODE, tenant_code: tenantDetail.code },
				{ attributes: ['id'] }
			)
			let defaultOrgId = defaultOrg.id
			const modelName = await userQueries.getModelName()

			let validationData = await entityTypeQueries.findUserEntityTypesAndEntities({
				status: 'ACTIVE',
				organization_id: {
					[Op.in]: [user.organization_id, defaultOrgId],
				},
				tenant_code: tenantDetail.code,
				model_names: { [Op.contains]: [modelName] },
			})

			const prunedEntities = removeDefaultOrgEntityTypes(validationData, user.organization_id)
			user = await utils.processDbResponse(user, prunedEntities)

			if (user && user.image) {
				user.image = await utils.getDownloadableUrl(user.image)
			}

			// Return original identifier (email, phone, or username)
			user.identifier = identifier
			const result = { access_token: accessToken, refresh_token: refreshToken, user }

			// Update session and Redis
			await userSessionsService.updateUserSessionAndsetRedisData(
				userSessionDetails.result.id,
				accessToken,
				refreshToken
			)

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
	 * logout user account
	 * @method
	 * @name logout
	 * @param {Object} req -request data.
	 * @param {Integer} user_id - user id.
	 * @param {Integer} organization_id - organization id.
	 * @param {string} bodyData.refresh_token - refresh token.
	 * @returns {JSON} - returns accounts loggedout information.
	 */

	static async logout(bodyData, user_id, organization_id, userSessionId, tenantCode) {
		try {
			const user = await userQueries.findOne({ id: user_id, tenant_code: tenantCode })
			if (!user) {
				return responses.failureResponse({
					message: 'USER_NOT_FOUND',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}
			/**
			 * Aquire user session_id based on the requests
			 */
			let userSessions = []
			if (bodyData.userSessionIds && bodyData.userSessionIds.length > 0) {
				userSessions = bodyData.userSessionIds
			} else {
				userSessions.push(userSessionId)
			}

			await userSessionsService.removeUserSessions(userSessions)

			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'LOGGED_OUT_SUCCESSFULLY',
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	/**
	 * generate token
	 * @method
	 * @name generateToken
	 * @param {Object} bodyData -request data.
	 * @param {string} bodyData.refresh_token - refresh token.
	 * @returns {JSON} - returns access token info
	 */

	static async generateToken(bodyData) {
		let decodedToken
		try {
			decodedToken = jwt.verify(bodyData.refresh_token, process.env.REFRESH_TOKEN_SECRET)
		} catch (error) {
			/* If refresh token is expired */
			error.statusCode = httpStatusCode.unauthorized
			error.message = 'REFRESH_TOKEN_EXPIRED'
			throw error
		}

		const user = await userQueries.findByPk(decodedToken.data.id)

		/* Check valid user */
		if (!user) {
			return responses.failureResponse({
				message: 'USER_NOT_FOUND',
				statusCode: httpStatusCode.bad_request,
				responseCode: 'CLIENT_ERROR',
			})
		}

		/* check if redis data is present*/
		// Get redis key for session
		const sessionId = decodedToken.data.session_id.toString()

		// Get data from redis
		let redisData = (await utilsHelper.redisGet(sessionId)) || {}

		// if idle time set to infinity then db check should be done
		if (!Object.keys(redisData).length && process.env.ALLOWED_IDLE_TIME == null) {
			const userSessionData = await userSessionsService.findUserSession(
				{
					id: decodedToken.data.session_id,
				},
				{
					attributes: ['refresh_token'],
				}
			)
			if (!userSessionData) {
				return responses.failureResponse({
					message: 'REFRESH_TOKEN_NOT_FOUND',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'CLIENT_ERROR',
				})
			}
			redisData.refreshToken = userSessionData[0].refresh_token
		}

		// If data is not in redis, token is invalid
		if (!redisData || redisData.refreshToken !== bodyData.refresh_token) {
			return responses.failureResponse({
				message: 'REFRESH_TOKEN_NOT_FOUND',
				statusCode: httpStatusCode.unauthorized,
				responseCode: 'CLIENT_ERROR',
			})
		}

		/* Generate new access token */
		const accessToken = utilsHelper.generateToken(
			{ data: decodedToken.data },
			process.env.ACCESS_TOKEN_SECRET,
			common.accessTokenExpiry
		)

		/**
		 * When idle tine is infinity set TTL to access token expiry
		 * If not redis data won't expire and timeout session will show as active in listing
		 */
		let expiryTime = process.env.ALLOWED_IDLE_TIME
		if (process.env.ALLOWED_IDLE_TIME == null) {
			expiryTime = utilsHelper.convertDurationToSeconds(common.accessTokenExpiry)
		}
		redisData.accessToken = accessToken
		const res = await utilsHelper.redisSet(sessionId, redisData, expiryTime)

		// update user-sessions with access token
		let check = await userSessionsService.updateUserSession(
			{
				id: decodedToken.data.id,
			},
			{
				token: accessToken,
			}
		)
		return responses.successResponse({
			statusCode: httpStatusCode.ok,
			message: 'ACCESS_TOKEN_GENERATED_SUCCESSFULLY',
			result: { access_token: accessToken },
		})
	}

	/**
	 * generate otp
	 * @method
	 * @name generateOtp
	 * @param {Object} bodyData -request data.
	 * @param {string} bodyData.email - user email.
	 * @param {string} bodyData.password - user email.
	 * @returns {JSON} - returns otp success response
	 */

	static async generateOtp(bodyData, domain) {
		try {
			const notFoundResponse = (message) =>
				responses.failureResponse({
					message,
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
				})

			// Validate tenant domain
			const tenantDomain = await tenantDomainQueries.findOne({ domain })
			if (!tenantDomain) {
				return notFoundResponse('TENANT_DOMAIN_NOT_FOUND_PING_ADMIN')
			}

			// Validate tenant
			const tenantDetail = await tenantQueries.findOne({
				code: tenantDomain.tenant_code,
			})
			if (!tenantDetail) {
				return notFoundResponse('TENANT_NOT_FOUND_PING_ADMIN')
			}
			const identifier = bodyData.identifier?.toLowerCase()
			if (!identifier) {
				return responses.failureResponse({
					message: 'IDENTIFIER_REQUIRED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			// Helper functions to detect identifier type
			const isEmail = (str) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(str)
			const isPhone = (str) => /^\+?[1-9]\d{1,14}$/.test(str) // Adjust regex as needed
			const isUsername = (str) => /^[a-zA-Z0-9_-]{3,30}$/.test(str)

			// Prepare query based on identifier type
			const query = {
				[Op.or]: [],
				password: { [Op.ne]: null },
				status: common.ACTIVE_STATUS,
				tenant_code: tenantDetail.code,
			}

			let encryptedIdentifier
			if (isEmail(identifier)) {
				encryptedIdentifier = emailEncryption.encrypt(identifier)
				query[Op.or].push({ email: encryptedIdentifier })
			} else if (isPhone(identifier)) {
				encryptedIdentifier = emailEncryption.encrypt(identifier) // Adjust if phone encryption differs
				query[Op.or].push({ phone: encryptedIdentifier, phone_code: bodyData.phone_code })
			} else if (isUsername(identifier)) {
				encryptedIdentifier = identifier // Username is not encrypted
				query[Op.or].push({ username: identifier })
			} else {
				return responses.failureResponse({
					message: 'INVALID_IDENTIFIER_FORMAT',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const user = await userQueries.findOne(query)

			if (!user) {
				return responses.failureResponse({
					statusCode: httpStatusCode.not_found,
					message: 'ACCOUNT_NOT_FOUND',
					responseCode: 'CLIENT_ERROR',
				})
			}

			const userData = await utilsHelper.redisGet(user.username)

			const [otp, isNew] =
				userData && userData.action === 'forgetpassword'
					? [userData.otp, false]
					: [utils.generateSecureOTP(), true]
			if (isNew) {
				const redisData = {
					verify: user.username,
					action: 'forgetpassword',
					otp,
				}
				const res = await utilsHelper.redisSet(user.username, redisData, common.otpExpirationTime)
				if (res !== 'OK')
					return responses.failureResponse({
						message: 'UNABLE_TO_SEND_OTP',
						statusCode: httpStatusCode.internal_server_error,
						responseCode: 'SERVER_ERROR',
					})
			}
			if (user.email) {
				notificationUtils.sendEmailNotification({
					emailId: emailEncryption.decrypt(user.email),
					templateCode: process.env.OTP_EMAIL_TEMPLATE_CODE,
					variables: { name: user.name, otp },
					tenantCode: tenantDetail.code,
				})
			}

			// Send SMS notification with OTP if phone is provided
			if (user.phone) {
				notificationUtils.sendSMSNotification({
					phoneNumber: emailEncryption.decrypt(user.phone),
					templateCode: process.env.OTP_EMAIL_TEMPLATE_CODE,
					variables: { app_name: tenantDetail.name, otp },
					tenantCode: tenantDetail.code,
				})
			}

			if (process.env.APPLICATION_ENV === 'development') console.log('DEV OTP->', { otp, isNew })
			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'OTP_SENT_SUCCESSFULLY',
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	/**
	 * otp to verify user during registration
	 * @method
	 * @name registrationOtp
	 * @param {Object} bodyData -request data.
	 * @param {string} bodyData.email - user email.
	 * @returns {JSON} - returns otp success response
	 */

	static async registrationOtp(bodyData, domain) {
		// Helper function for consistent not found responses
		const notFoundResponse = (message) => {
			return responses.failureResponse({
				message,
				statusCode: httpStatusCode.not_acceptable,
				responseCode: 'CLIENT_ERROR',
			})
		}

		// Validate tenant and domain
		const tenantDomain = await tenantDomainQueries.findOne({ domain })
		if (!tenantDomain) {
			return notFoundResponse('TENANT_DOMAIN_NOT_FOUND_PING_ADMIN')
		}

		const tenantDetail = await tenantQueries.findOne({
			code: tenantDomain.tenant_code,
			status: common.ACTIVE_STATUS,
		})
		if (!tenantDetail) {
			return notFoundResponse('TENANT_NOT_FOUND_PING_ADMIN')
		}

		// Validate that at least one contact method is provided
		if (!bodyData.email && !bodyData.phone) {
			return responses.failureResponse({
				message: 'EMAIL_OR_PHONE_REQUIRED',
				statusCode: httpStatusCode.bad_request,
				responseCode: 'CLIENT_ERROR',
			})
		}

		// Validate organization registration code if provided
		let domainDetails = null
		if (bodyData.registration_code) {
			domainDetails = await organizationQueries.findOne({
				tenant_code: tenantDetail.code,
				registration_code: bodyData.registration_code,
			})

			if (!domainDetails) {
				return responses.failureResponse({
					message: 'INVALID_ORG_registration_code',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
		}

		// Process email information
		let encryptedEmailId = null
		let plaintextEmailId = null
		if (bodyData.email) {
			plaintextEmailId = bodyData.email.toLowerCase()
			encryptedEmailId = emailEncryption.encrypt(plaintextEmailId)
			bodyData.email = encryptedEmailId
		}

		// Process phone information
		let encryptedPhoneNumber = null
		let plaintextPhoneNumber = null
		if (bodyData.phone && bodyData.phone_code) {
			plaintextPhoneNumber = bodyData.phone
			encryptedPhoneNumber = emailEncryption.encrypt(plaintextPhoneNumber)
			bodyData.phone = encryptedPhoneNumber
		}

		// Check if user already exists with email or phone or username
		const criteria = []
		if (encryptedEmailId) criteria.push({ email: encryptedEmailId })
		if (encryptedPhoneNumber) criteria.push({ phone: encryptedPhoneNumber })
		if (bodyData.username) criteria.push({ username: bodyData.username })

		if (criteria.length === 0) {
			return // Skip if no criteria
		}

		// Check if user already exists with email or phone or username
		let user = await userQueries.findOne(
			{
				[Op.or]: criteria,
				password: { [Op.ne]: null },
				tenant_code: tenantDetail.code,
			},
			{
				attributes: ['id'],
			}
		)

		// Return error if user already exists
		if (user) {
			return responses.failureResponse({
				message: 'USER_ALREADY_EXISTS',
				statusCode: httpStatusCode.not_acceptable,
				responseCode: 'CLIENT_ERROR',
			})
		}

		// Generate or retrieve OTP
		let emailUserData = encryptedEmailId ? await utilsHelper.redisGet(encryptedEmailId) : null
		let phoneUserData =
			encryptedPhoneNumber && bodyData.phone_code
				? await utilsHelper.redisGet(bodyData.phone_code + encryptedPhoneNumber)
				: null

		// Use existing OTP if already in progress, otherwise generate a new one
		const userData = emailUserData || phoneUserData
		// Usage: [generateSecureOTP(), true]

		const [otp, isNew] =
			userData && userData.action === 'signup' ? [userData.otp, false] : [utils.generateSecureOTP(), true]

		// Store OTP data in redis if it's new
		if (isNew) {
			const redisData = {
				verify: encryptedEmailId || encryptedPhoneNumber,
				action: 'signup',
				otp,
			}

			let redisSetResults = []

			// Store OTP for email if provided
			if (encryptedEmailId) {
				const emailResult = await utilsHelper.redisSet(encryptedEmailId, redisData, common.otpExpirationTime)
				redisSetResults.push(emailResult)
			}

			// Store OTP for phone if provided
			if (encryptedPhoneNumber && bodyData.phone_code) {
				const phoneResult = await utilsHelper.redisSet(
					bodyData.phone_code + encryptedPhoneNumber,
					redisData,
					common.otpExpirationTime
				)
				redisSetResults.push(phoneResult)
			}

			// Check if storing in Redis was successful
			if (!redisSetResults.includes('OK')) {
				return responses.failureResponse({
					message: 'UNABLE_TO_SEND_OTP',
					statusCode: httpStatusCode.internal_server_error,
					responseCode: 'SERVER_ERROR',
				})
			}
		}

		// Send email notification with OTP if email is provided
		if (plaintextEmailId) {
			notificationUtils.sendEmailNotification({
				emailId: plaintextEmailId,
				templateCode: process.env.REGISTRATION_OTP_EMAIL_TEMPLATE_CODE,
				variables: { name: bodyData.name || plaintextEmailId, otp },
				tenantCode: tenantDetail.code,
			})
		}

		// Send SMS notification with OTP if phone is provided
		if (plaintextPhoneNumber && bodyData.phone_code) {
			notificationUtils.sendSMSNotification({
				phoneNumber: plaintextPhoneNumber,
				templateCode: process.env.REGISTRATION_OTP_EMAIL_TEMPLATE_CODE,
				variables: { app_name: tenantDetail.name, otp },
				tenantCode: tenantDetail.code,
			})
		}

		// Log OTP in development environment for testing
		if (process.env.APPLICATION_ENV === 'development') {
			console.log('DEV OTP:', otp)
		}

		// Return success response
		return responses.successResponse({
			statusCode: httpStatusCode.ok,
			message: 'REGISTRATION_OTP_SENT_SUCCESSFULLY',
		})
	}

	/**
	 * Reset password
	 * @method
	 * @name resetPassword
	 * @param {Object} req -request data.
	 * @param {string} bodyData.email - user email.
	 * @param {string} bodyData.otp - user otp.
	 * @param {string} bodyData.password - user password.
	 * @returns {JSON} - returns password reset response
	 */

	static async resetPassword(bodyData, deviceInfo, domain) {
		const projection = ['location']
		try {
			const notFoundResponse = (message) =>
				responses.failureResponse({
					message,
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
				})

			// Validate tenant domain
			const tenantDomain = await tenantDomainQueries.findOne({ domain })
			if (!tenantDomain) {
				return notFoundResponse('TENANT_DOMAIN_NOT_FOUND_PING_ADMIN')
			}

			// Validate tenant
			const tenantDetail = await tenantQueries.findOne({
				code: tenantDomain.tenant_code,
			})
			if (!tenantDetail) {
				return notFoundResponse('TENANT_NOT_FOUND_PING_ADMIN')
			}
			const identifier = bodyData.identifier?.toLowerCase()
			if (!identifier) {
				return responses.failureResponse({
					message: 'IDENTIFIER_REQUIRED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			// Helper functions to detect identifier type
			const isEmail = (str) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(str)
			const isPhone = (str) => /^\+?[1-9]\d{1,14}$/.test(str) // Adjust regex as needed
			const isUsername = (str) => /^[a-zA-Z0-9_-]{3,30}$/.test(str)

			// Prepare query based on identifier type
			const query = {
				[Op.or]: [],
				password: { [Op.ne]: null },
				status: common.ACTIVE_STATUS,
				tenant_code: tenantDetail.code,
			}

			let encryptedIdentifier
			if (isEmail(identifier)) {
				encryptedIdentifier = emailEncryption.encrypt(identifier)
				query[Op.or].push({ email: encryptedIdentifier })
			} else if (isPhone(identifier)) {
				encryptedIdentifier = emailEncryption.encrypt(identifier) // Adjust if phone encryption differs
				query[Op.or].push({ phone: encryptedIdentifier, phone_code: bodyData.phone_code })
			} else if (isUsername(identifier)) {
				encryptedIdentifier = identifier // Username is not encrypted
				query[Op.or].push({ username: identifier })
			} else {
				return responses.failureResponse({
					message: 'INVALID_IDENTIFIER_FORMAT',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			// Validate OTP in Redis

			// Find user details
			let user = await userQueries.findUserWithOrganization(
				query,
				{
					attributes: {
						exclude: projection,
					},
				},
				true
			)
			if (!user) {
				return responses.failureResponse({
					message: 'RESET_OTP_INVALID',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const redisData = await utilsHelper.redisGet(user.username)
			if (!redisData || redisData.otp != bodyData.otp) {
				return responses.failureResponse({
					message: 'RESET_OTP_INVALID',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			// Validate user roles
			/* 			let roles = await roleQueries.findAll({
				id: user.roles,
				status: common.ACTIVE_STATUS,
				tenant_code: tenantDetail.code,
			})
			if (!roles) {
				return responses.failureResponse({
					message: 'ROLE_NOT_FOUND',
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
				})
			}
			user.user_roles = roles */

			// Check if new password is same as old
			const isPasswordSame = bcryptJs.compareSync(bodyData.password, user.password)
			if (isPasswordSame) {
				return responses.failureResponse({
					message: 'RESET_PREVIOUS_PASSWORD',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			// Hash new password
			bodyData.password = utilsHelper.hashPassword(bodyData.password)

			// Create user session
			const userSessionDetails = await userSessionsService.createUserSession(user.id, '', '', deviceInfo)
			user = UserTransformDTO.transform(user) // Transform the data
			const tokenDetail = {
				data: {
					id: user.id,
					name: user.name,
					session_id: userSessionDetails.result.id,
					organization_ids: user.organizations.map((org) => String(org.id)), // Convert to string
					organization_codes: user.organizations.map((org) => String(org.code)), // Convert to string					// tenant_id: tenant_id,
					tenant_code: tenantDetail.code,
					organizations: user.organizations,
				},
			}

			// Generate tokens
			const accessToken = utilsHelper.generateToken(
				tokenDetail,
				process.env.ACCESS_TOKEN_SECRET,
				common.accessTokenExpiry
			)
			const refreshToken = utilsHelper.generateToken(
				tokenDetail,
				process.env.REFRESH_TOKEN_SECRET,
				common.refreshTokenExpiry
			)

			// Update user credentials
			await userQueries.updateUser(
				{ id: user.id, tenant_code: tenantDetail.code },
				{ password: bodyData.password }
			)
			await utilsHelper.redisDel(encryptedIdentifier)

			// Clean up user data
			delete user.password
			delete user.otpInfo

			// Fetch default organization and validation data
			let defaultOrg = await organizationQueries.findOne(
				{ code: process.env.DEFAULT_ORGANISATION_CODE, tenant_code: tenantDetail.code },
				{ attributes: ['id'] }
			)
			let defaultOrgId = defaultOrg.id
			const modelName = await userQueries.getModelName()

			let validationData = await entityTypeQueries.findUserEntityTypesAndEntities({
				status: 'ACTIVE',
				organization_id: {
					[Op.in]: [user.organization_id, defaultOrgId],
				},
				model_names: { [Op.contains]: [modelName] },
				tenant_code: tenantDetail.code,
			})

			const prunedEntities = removeDefaultOrgEntityTypes(validationData, user.organization_id)
			user = await utils.processDbResponse(user, prunedEntities)

			// Handle user image
			if (user && user.image) {
				user.image = await utils.getDownloadableUrl(user.image)
			}

			// Return original identifier
			user.identifier = identifier

			/**update a new session entry with redis insert */
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

			const result = { access_token: accessToken, refresh_token: refreshToken, user }
			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'PASSWORD_RESET_SUCCESSFULLY',
				result,
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	/**
	 * Account List
	 * @method
	 * @name list method post
	 * @param {Object} req -request data.
	 * @param {Array} userIds -contains userIds.
	 * @returns {JSON} - all accounts data
	 *
	 *
	 * User list.
	 * @method
	 * @name list method get
	 * @param {Boolean} userType - mentor/mentee.
	 * @param {Number} page - page No.
	 * @param {Number} limit - page limit.
	 * @param {String} search - search field.
	 * @returns {JSON} - List of users
	 */
	static async list(params, tenantCode) {
		try {
			if (params?.body?.userIds) {
				const userIds = params.body.userIds

				const userIdsNotFoundInRedis = []
				const userDetailsFoundInRedis = []

				// Fetch user details from Redis in parallel
				await Promise.all(
					userIds.map(async (userId) => {
						const redisKey = `${common.redisUserPrefix}${tenantCode}_${userId}`
						let userDetails = await utilsHelper.redisGet(redisKey)

						if (!userDetails) {
							userIdsNotFoundInRedis.push(userId)
						} else {
							if (userDetails.image) {
								userDetails.image_cloud_path = userDetails.image
								userDetails.image = await utils.getDownloadableUrl(userDetails.image)
							}
							userDetailsFoundInRedis.push(userDetails)
						}
					})
				)

				let users = []
				// Only query DB if needed
				if (userIdsNotFoundInRedis.length > 0) {
					const filterQuery = { id: userIdsNotFoundInRedis }

					const options = {
						attributes: { exclude: ['password', 'refresh_tokens'] },
						// Add paranoid option based on internal access token and query param
						paranoid: !(
							params.headers.internal_access_token && params.query?.exclude_deleted_records === 'false'
						),
					}

					users = await userQueries.findAllUserWithOrganization(filterQuery, options, tenantCode)

					// Handle decryption and image URL for DB users
					await Promise.all(
						users.map(async (user) => {
							user.email = emailEncryption.decrypt(user.email)
							if (user.image) {
								user.image_cloud_path = user.image
								user.image = await utils.getDownloadableUrl(user.image)
							}
						})
					)
				}

				return responses.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'USERS_FETCHED_SUCCESSFULLY',
					result: [...users, ...userDetailsFoundInRedis],
				})
			} else {
				let role = await roleQueries.findOne(
					{ title: params.query.type.toLowerCase() },
					{
						attributes: ['id'],
					}
				)

				let users = await userQueries.listUsers(
					role && role.id ? role.id : '',
					params.query.organization_id ? params.query.organization_id : '',
					params.pageNo,
					params.pageSize,
					params.searchText,
					tenantCode
				)
				let foundKeys = {}
				let result = []

				/* Required to resolve all promises first before preparing response object else sometime 
				it will push unresolved promise object if you put this logic in below for loop */

				await Promise.all(
					users.data.map(async (user) => {
						/* Assigned image url from the stored location */
						if (user.image) {
							user['image_cloud_path'] = user.image
							user.image = await utilsHelper.getDownloadableUrl(user.image)
						}
						return user
					})
				)
				if (users.count == 0) {
					return responses.successResponse({
						statusCode: httpStatusCode.ok,
						message: 'USER_LIST',
						result: {
							data: [],
							count: 0,
						},
					})
				}

				for (let user of users.data) {
					let firstChar = user.name.charAt(0)
					firstChar = firstChar.toUpperCase()

					if (!foundKeys[firstChar]) {
						result.push({
							key: firstChar,
							values: [user],
						})
						foundKeys[firstChar] = result.length
					} else {
						let index = foundKeys[firstChar] - 1
						result[index].values.push(user)
					}
				}

				const sortedData = _.sortBy(result, 'key') || []

				return responses.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'USER_LIST',
					result: {
						data: sortedData,
						count: users.count,
					},
				})
			}
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	/**
	 * Accept term and condition
	 * @method
	 * @name acceptTermsAndCondition
	 * @param {string} userId - userId.
	 * @returns {JSON} - returns accept the term success response
	 */
	static async acceptTermsAndCondition(userId, orgId) {
		try {
			const user = await userQueries.findByPk(userId)

			if (!user) {
				return responses.failureResponse({
					message: 'USER_DOESNOT_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			await userQueries.updateUser(
				{ id: userId, organization_id: orgId },
				{ has_accepted_terms_and_conditions: true }
			)
			await utilsHelper.redisDel(common.redisUserPrefix + userId.toString())

			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'USER_UPDATED_SUCCESSFULLY',
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * Delete own account
	 * @method
	 * @name deleteOwnAccount
	 * @param {Object} req - request object
	 * @returns {JSON} - delete user response
	 */
	static async deleteOwnAccount(userId, bodyData, tenantCode) {
		try {
			const user = await userQueries.findOne({ id: userId, tenant_code: tenantCode })

			if (!user) {
				return responses.failureResponse({
					message: 'USER_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			const isPasswordCorrect = bcryptJs.compareSync(bodyData.password, user.password)

			if (!isPasswordCorrect) {
				return responses.failureResponse({
					message: 'IDENTIFIER_OR_PASSWORD_INVALID',
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
					created_by: userId,
					username: result.user?.username,
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
	 * Update role of user
	 * @method
	 * @name changeRole
	 * @param {string} bodyData.email - email of user.
	 * @param {string} bodyData.role - role of user.
	 * @returns {JSON} change role success response
	 */
	static async changeRole(bodyData) {
		try {
			const plaintextEmailId = bodyData.email.toLowerCase()
			const encryptedEmailId = emailEncryption.encrypt(plaintextEmailId)
			let role = await roleQueries.findOne({ title: bodyData.role.toLowerCase() })
			if (!role) {
				return responses.failureResponse({
					message: 'ROLE_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			const userCredentials = await UserCredentialQueries.findOne({
				email: encryptedEmailId,
				password: {
					[Op.ne]: null,
				},
			})
			if (!userCredentials) {
				return responses.failureResponse({
					message: 'USER_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			const [affectedRows] = await userQueries.updateUser(
				{ id: userCredentials.user_id, organization_id: userCredentials.organization_id },
				{ role_id: role.id }
			)
			/* If user doc not updated  */
			if (affectedRows == 0) {
				return responses.failureResponse({
					message: 'USER_DOESNOT_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'USER_ROLE_UPDATED_SUCCESSFULLY',
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	/**
	 * Account List
	 * @method
	 * @name list method post
	 * @param {Object} req -request data.
	 * @param {Array} userIds -contains userIds.
	 * @returns {JSON} - all accounts data
	 * User list.
	 * @method
	 * @name list method get
	 * @param {Boolean} userType - mentor/mentee.
	 * @param {Number} page - page No.
	 * @param {Number} limit - page limit.
	 * @param {String} search - search field.
	 * @returns {JSON} - List of users
	 */
	static async search(params) {
		try {
			let roleQuery = {}
			if (params.query.type.toLowerCase() === common.TYPE_ALL) {
				roleQuery.status = common.ACTIVE_STATUS
			} else {
				const types = params.query.type.toLowerCase().split(',')
				roleQuery.title = types
			}

			const roles = await roleQueries.findAll(roleQuery, {
				attributes: ['id'],
			})

			const roleIds = roles.map((role) => role.id)
			let emailIds = []
			let searchText = []

			if (params.searchText) {
				searchText = params.searchText.split(',')
			}
			searchText.forEach((element) => {
				if (utils.isValidEmail(element)) {
					emailIds.push(emailEncryption.encrypt(element.toLowerCase()))
				}
			})

			let users = await userQueries.listUsersFromView(
				roleIds ? roleIds : [],
				params.query.organization_id ? params.query.organization_id : '',
				params.pageNo,
				params.pageSize,
				emailIds.length == 0 ? params.searchText : false,
				params.body.user_ids ? params.body.user_ids : false,
				emailIds.length > 0 ? emailIds : false,
				params.body.excluded_user_ids ? params.body.excluded_user_ids : false
			)

			/* Required to resolve all promises first before preparing response object else sometime 
					it will push unresolved promise object if you put this logic in below for loop */

			await Promise.all(
				users.data.map(async (user) => {
					/* Assigned image url from the stored location */
					if (user.image) {
						user.image = await utilsHelper.getDownloadableUrl(user.image)
					}
					return user
				})
			)
			if (users.count == 0) {
				return responses.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'USER_LIST',
					result: {
						data: [],
						count: 0,
					},
				})
			}

			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'USER_LIST',
				result: {
					data: users.data,
					count: users.count,
				},
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	/**
	 * change password
	 * @method
	 * @name changePassword
	 * @param {Object} req -request data.
	 * @param {Object} req.decodedToken.id - UserId.
	 * @param {string} req.body - request body contains user password
	 * @param {string} req.body.OldPassword - user Old Password.
	 * @param {string} req.body.NewPassword - user New Password.
	 * @param {string} req.body.ConfirmNewPassword - user Confirming New Password.
	 * @returns {JSON} - password changed response
	 */

	static async changePassword(bodyData, userId, tenantCode) {
		try {
			const user = await userQueries.findOne(
				{ id: userId, tenant_code: tenantCode },
				{ attributes: ['id', 'password', 'email', 'username', 'name'] }
			)
			if (!user) {
				return responses.failureResponse({
					message: ERROR_MESSAGES.USER_DOESNOT_EXISTS,
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const verifyOldPassword = utilsHelper.comparePassword(bodyData.oldPassword, user.password)
			if (!verifyOldPassword) {
				return responses.failureResponse({
					message: 'INCORRECT_OLD_PASSWORD',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const isPasswordSame = utilsHelper.comparePassword(bodyData.newPassword, user.password)
			if (isPasswordSame) {
				return responses.failureResponse({
					message: 'SAME_PASSWORD_ERROR',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			bodyData.newPassword = utilsHelper.hashPassword(bodyData.newPassword)

			const updateParams = { password: bodyData.newPassword, refresh_tokens: [] }

			await userQueries.updateUser({ id: user.id, tenant_code: tenantCode }, updateParams)
			//await UserCredentialQueries.updateUser({ email: userCredentials.email }, { password: bodyData.newPassword })

			const redisUserKey = common.redisUserPrefix + tenantCode + '_' + user.id.toString()

			// remove profile caching
			await utils.redisDel(redisUserKey)

			// remove reset otp caching
			await utils.redisDel(user?.username)

			// Find active sessions of user and remove them
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
			/**
			 * 1: Remove redis data
			 * 2: Update ended_at in user-sessions
			 */
			await userSessionsService.removeUserSessions(userSessionIds)

			// Send email notification with OTP if email is provided
			if (user?.email) {
				notificationUtils.sendEmailNotification({
					emailId: emailEncryption.decrypt(user.email),
					templateCode: process.env.CHANGE_PASSWORD_TEMPLATE_CODE,
					variables: { name: user.name },
					tenantCode: tenantCode,
				})
			}

			const result = {}
			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'PASSWORD_CHANGED_SUCCESSFULLY',
				result,
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	/**
	 * Account Search By Email
	 * @method
	 * @name list method post
	 * @param {Object} req -request data.
	 * @param {Array} userIds -contains emailIds.
	 * @returns {JSON} - all accounts data
	 */

	static async validatingEmailIds(params) {
		if (params?.body?.emailIds) {
			const emailIds = params.body.emailIds
			const encryptedEmailIds = emailIds.map((email) => {
				if (typeof email !== 'string') {
					throw new TypeError('Each email ID must be a string.')
				}
				return emailEncryption.encrypt(email)
			})

			let filterQuery = { email: { [Op.in]: encryptedEmailIds } }
			const options = { attributes: ['email', 'id'] }

			let users = await userQueries.findAll(filterQuery, options)
			users = users || []
			const userIdsAndInvalidEmails = []

			for (const encryptedEmail of encryptedEmailIds) {
				const user = users.find((u) => u.email === encryptedEmail) // Find user by email
				if (user) {
					try {
						user.email = emailEncryption.decrypt(user.email)
						userIdsAndInvalidEmails.push(user.id)
					} catch (err) {
						console.error(`Decryption failed for email: ${encryptedEmail}`, err)
						const originalEmail = emailEncryption.decrypt(encryptedEmail)
						userIdsAndInvalidEmails.push(originalEmail)
					}
				} else {
					try {
						const originalEmail = emailEncryption.decrypt(encryptedEmail)
						userIdsAndInvalidEmails.push(originalEmail)
					} catch (err) {
						console.error(`Decryption failed for email: ${encryptedEmail}`, err)
						userIdsAndInvalidEmails.push('Decryption failed')
					}
				}
			}

			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'USERS_FETCHED_SUCCESSFULLY',
				result: userIdsAndInvalidEmails,
			})
		}
	}
}
