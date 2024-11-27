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
const sequelize = require('@database/models/index').sequelize
const { removeDefaultOrgEntityTypes } = require('@generics/utils')
const UserCredentialQueries = require('@database/queries/userCredential')
const emailEncryption = require('@utils/emailEncryption')
const responses = require('@helpers/responses')
const userSessionsService = require('@services/user-sessions')
module.exports = class AccountHelper {
	/**
	 * create account
	 * @method
	 * @name create
	 * @param {Object} bodyData -request body contains user creation deatils.
	 * @param {String} bodyData.secretCode - secrate code to create mentor.
	 * @param {String} bodyData.name - name of the user.
	 * @param {Boolean} bodyData.isAMentor - is a mentor or not .
	 * @param {String} bodyData.email - user email.
	 * @param {String} bodyData.password - user password.
	 * @param {Object} deviceInfo - Device information
	 * @returns {JSON} - returns account creation details.
	 */

	static async create(bodyData, deviceInfo) {
		const projection = ['password']
		const transaction = await sequelize.transaction()

		try {
			const plaintextEmailId = bodyData.email.toLowerCase()
			const encryptedEmailId = emailEncryption.encrypt(plaintextEmailId)
			let user = await UserCredentialQueries.findOne({
				email: encryptedEmailId,
				password: {
					[Op.ne]: null,
				},
			})

			if (user) {
				return responses.failureResponse({
					message: 'USER_ALREADY_EXISTS',
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
				})
			}

			if (process.env.ENABLE_EMAIL_OTP_VERIFICATION === 'true') {
				const redisData = await utilsHelper.redisGet(encryptedEmailId)
				if (!redisData || redisData.otp != bodyData.otp) {
					return responses.failureResponse({
						message: 'OTP_INVALID',
						statusCode: httpStatusCode.bad_request,
						responseCode: 'CLIENT_ERROR',
					})
				}
			}

			bodyData.password = utilsHelper.hashPassword(bodyData.password)

			//check user exist in invitee list
			let role,
				roles = []

			let invitedUserMatch = false
			const invitedUserId = await UserCredentialQueries.findOne(
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

			if (invitedUserId) {
				invitedUserMatch = await userInviteQueries.findOne({
					id: invitedUserId.organization_user_invite_id,
					organization_id: invitedUserId.organization_id,
				}) //add org id here to optimize the query
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
				let emailDomain = utilsHelper.extractDomainFromEmail(plaintextEmailId)
				let domainDetails = await orgDomainQueries.findOne({
					domain: emailDomain,
				})
				bodyData.organization_id = domainDetails
					? domainDetails.organization_id
					: (
							await organizationQueries.findOne(
								{
									code: process.env.DEFAULT_ORGANISATION_CODE,
								},
								{ attributes: ['id'] }
							)
					  ).id

				//add default role as mentee
				role = await roleQueries.findAll(
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
			bodyData.email = encryptedEmailId

			const insertedUser = await userQueries.create(bodyData, transaction)

			const userCredentialsBody = {
				email: encryptedEmailId,
				password: bodyData.password,
				organization_id: insertedUser.organization_id,
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
					},
					transaction
				)
			} else {
				userCredentials = await UserCredentialQueries.create(userCredentialsBody, transaction)
			}
			await transaction.commit()

			/* FLOW STARTED: user login after registration */
			user = await userQueries.findUserWithOrganization(
				{ id: insertedUser.id, organization_id: insertedUser.organization_id },
				{
					attributes: {
						exclude: projection,
					},
				}
			)

			const roleData = await roleQueries.findAll(
				{
					id: {
						[Op.in]: bodyData.roles,
					},
				},
				{
					attributes: {
						exclude: ['created_at', 'updated_at', 'deleted_at'],
					},
				}
			)

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

			const tokenDetail = {
				data: {
					id: user.id,
					name: user.name,
					session_id: userSessionDetails.result.id,
					organization_id: user.organization_id,
					roles: roleData,
				},
			}

			user.user_roles = roleData

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
			await utilsHelper.redisDel(encryptedEmailId)

			//make the user as org admin
			if (isOrgAdmin) {
				let organization = await organizationQueries.findByPk(user.organization_id)
				const orgAdmins = _.uniq([...(organization.org_admin || []), user.id])
				await organizationQueries.update(
					{
						id: user.organization_id,
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

			if (templateData) {
				// Push successful registration email to kafka
				const payload = {
					type: common.notificationEmailType,
					email: {
						to: plaintextEmailId,
						subject: templateData.subject,
						body: utilsHelper.composeEmailBody(templateData.body, {
							name: bodyData.name,
							appName: process.env.APP_NAME,
							roles: roleToString || '',
							portalURL: process.env.PORTAL_URL,
						}),
					},
				}

				await kafkaCommunication.pushEmailToKafka(payload)
			}

			let defaultOrg = await organizationQueries.findOne(
				{ code: process.env.DEFAULT_ORGANISATION_CODE },
				{ attributes: ['id'] }
			)
			const defaultOrgId = defaultOrg.id
			const modelName = await userQueries.getModelName()

			let validationData = await entityTypeQueries.findUserEntityTypesAndEntities({
				status: 'ACTIVE',
				organization_id: {
					[Op.in]: [user.organization_id, defaultOrgId],
				},
				model_names: { [Op.contains]: [modelName] },
			})

			const prunedEntities = removeDefaultOrgEntityTypes(validationData, user.organization_id)
			result.user = utils.processDbResponse(result.user, prunedEntities)

			result.user.email = plaintextEmailId
			return responses.successResponse({
				statusCode: httpStatusCode.created,
				message: 'USER_CREATED_SUCCESSFULLY',
				result,
			})
		} catch (error) {
			console.log(error)
			await transaction.rollback()
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

	static async login(bodyData, deviceInformation) {
		try {
			const plaintextEmailId = bodyData.email.toLowerCase()
			const encryptedEmailId = emailEncryption.encrypt(plaintextEmailId)
			const userCredentials = await UserCredentialQueries.findOne({
				email: encryptedEmailId,
				password: {
					[Op.ne]: null,
				},
			})

			if (!userCredentials) {
				return responses.failureResponse({
					message: 'EMAIL_ID_NOT_REGISTERED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			let user = await userQueries.findUserWithOrganization({
				id: userCredentials.user_id,
				organization_id: userCredentials.organization_id,
				status: common.ACTIVE_STATUS,
			})
			if (!user) {
				return responses.failureResponse({
					message: 'EMAIL_ID_NOT_REGISTERED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			// check if login is allowed or not
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

			const isPasswordCorrect = bcryptJs.compareSync(bodyData.password, userCredentials.password)
			if (!isPasswordCorrect) {
				return responses.failureResponse({
					message: 'USERNAME_OR_PASSWORD_IS_INVALID',
					statusCode: httpStatusCode.bad_request,
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

			//Change to
			let defaultOrg = await organizationQueries.findOne(
				{ code: process.env.DEFAULT_ORGANISATION_CODE },
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
			})

			const prunedEntities = removeDefaultOrgEntityTypes(validationData, user.organization_id)
			user = utils.processDbResponse(user, prunedEntities)

			if (user && user.image) {
				user.image = await utils.getDownloadableUrl(user.image)
			}
			user.email = plaintextEmailId
			const result = { access_token: accessToken, refresh_token: refreshToken, user }

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

	static async logout(bodyData, user_id, organization_id, userSessionId) {
		try {
			const user = await userQueries.findOne({ id: user_id, organization_id })
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

	static async generateOtp(bodyData) {
		try {
			const plaintextEmailId = bodyData.email.toLowerCase()
			const encryptedEmailId = emailEncryption.encrypt(plaintextEmailId)
			const userCredentials = await UserCredentialQueries.findOne({
				email: encryptedEmailId,
				password: {
					[Op.ne]: null,
				},
			})
			if (!userCredentials)
				return responses.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'OTP_SENT_SUCCESSFULLY',
				})

			const user = await userQueries.findOne({
				id: userCredentials.user_id,
				organization_id: userCredentials.organization_id,
			})
			if (!user)
				return responses.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'OTP_SENT_SUCCESSFULLY',
				})

			const isPasswordSame = bcryptJs.compareSync(bodyData.password, userCredentials.password)
			if (isPasswordSame)
				return responses.failureResponse({
					message: 'RESET_PREVIOUS_PASSWORD',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})

			const userData = await utilsHelper.redisGet(encryptedEmailId)
			const [otp, isNew] =
				userData && userData.action === 'forgetpassword'
					? [userData.otp, false]
					: [Math.floor(Math.random() * 900000 + 100000), true]
			if (isNew) {
				const redisData = {
					verify: encryptedEmailId,
					action: 'forgetpassword',
					otp,
				}
				const res = await utilsHelper.redisSet(encryptedEmailId, redisData, common.otpExpirationTime)
				if (res !== 'OK')
					return responses.failureResponse({
						message: 'UNABLE_TO_SEND_OTP',
						statusCode: httpStatusCode.internal_server_error,
						responseCode: 'SERVER_ERROR',
					})
			}

			const templateData = await notificationTemplateQueries.findOneEmailTemplate(
				process.env.OTP_EMAIL_TEMPLATE_CODE,
				user.organization_id
			)
			if (templateData) {
				const payload = {
					type: common.notificationEmailType,
					email: {
						to: plaintextEmailId,
						subject: templateData.subject,
						body: utilsHelper.composeEmailBody(templateData.body, { name: user.name, otp }),
					},
				}
				await kafkaCommunication.pushEmailToKafka(payload)
			}
			if (process.env.APPLICATION_ENV === 'development') console.log({ otp, isNew })
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

	static async registrationOtp(bodyData) {
		const plaintextEmailId = bodyData.email.toLowerCase()
		const encryptedEmailId = emailEncryption.encrypt(plaintextEmailId)
		const userCredentials = await UserCredentialQueries.findOne({
			email: encryptedEmailId,
			password: {
				[Op.ne]: null,
			},
		})
		if (userCredentials)
			return responses.failureResponse({
				message: 'USER_ALREADY_EXISTS',
				statusCode: httpStatusCode.bad_request,
				responseCode: 'CLIENT_ERROR',
			})

		const userData = await utilsHelper.redisGet(encryptedEmailId)
		const [otp, isNew] =
			userData && userData.action === 'signup'
				? [userData.otp, false]
				: [Math.floor(Math.random() * 900000 + 100000), true]
		if (isNew) {
			const redisData = {
				verify: encryptedEmailId,
				action: 'signup',
				otp,
			}
			const res = await utilsHelper.redisSet(encryptedEmailId, redisData, common.otpExpirationTime)
			if (res !== 'OK') {
				return responses.failureResponse({
					message: 'UNABLE_TO_SEND_OTP',
					statusCode: httpStatusCode.internal_server_error,
					responseCode: 'SERVER_ERROR',
				})
			}
		}
		const templateData = await notificationTemplateQueries.findOneEmailTemplate(
			process.env.REGISTRATION_OTP_EMAIL_TEMPLATE_CODE
		)
		if (templateData) {
			const payload = {
				type: common.notificationEmailType,
				email: {
					to: plaintextEmailId,
					subject: templateData.subject,
					body: utilsHelper.composeEmailBody(templateData.body, { name: bodyData.name, otp }),
				},
			}
			await kafkaCommunication.pushEmailToKafka(payload)
		}
		if (process.env.APPLICATION_ENV === 'development') console.log(otp)
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

	static async resetPassword(bodyData, deviceInfo) {
		const projection = ['location']
		try {
			const plaintextEmailId = bodyData.email.toLowerCase()
			const encryptedEmailId = emailEncryption.encrypt(plaintextEmailId)

			const redisData = await utilsHelper.redisGet(encryptedEmailId)
			if (!redisData || redisData.otp != bodyData.otp) {
				return responses.failureResponse({
					message: 'RESET_OTP_INVALID',
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
					message: 'USER_DOESNOT_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			let user = await userQueries.findOne(
				{ id: userCredentials.user_id, organization_id: userCredentials.organization_id },
				{
					attributes: {
						exclude: projection,
					},
				}
			)
			if (!user) {
				return responses.failureResponse({
					message: 'USER_DOESNOT_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			let roles = await roleQueries.findAll({ id: user.roles, status: common.ACTIVE_STATUS })
			if (!roles) {
				return responses.failureResponse({
					message: 'ROLE_NOT_FOUND',
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
				})
			}
			user.user_roles = roles

			const isPasswordSame = bcryptJs.compareSync(bodyData.password, userCredentials.password)
			if (isPasswordSame) {
				return responses.failureResponse({
					message: 'RESET_PREVIOUS_PASSWORD',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			bodyData.password = utilsHelper.hashPassword(bodyData.password)

			// create user session entry and add session_id to token data
			const userSessionDetails = await userSessionsService.createUserSession(
				user.id, // userid
				'', // refresh token
				'', // Access token
				deviceInfo
			)
			const tokenDetail = {
				data: {
					id: user.id,
					name: user.name,
					session_id: userSessionDetails.result.id,
					organization_id: user.organization_id,
					roles,
				},
			}

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

			await UserCredentialQueries.updateUser(
				{
					email: encryptedEmailId,
				},
				{ password: bodyData.password }
			)
			await utilsHelper.redisDel(encryptedEmailId)

			delete user.password
			delete user.otpInfo

			let defaultOrg = await organizationQueries.findOne(
				{ code: process.env.DEFAULT_ORGANISATION_CODE },
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
			})

			const prunedEntities = removeDefaultOrgEntityTypes(validationData, user.organization_id)
			user = utils.processDbResponse(user, prunedEntities)

			// Check if user and user.image exist, then fetch a downloadable URL for the image
			if (user && user.image) {
				user.image = await utils.getDownloadableUrl(user.image)
			}
			user.email = plaintextEmailId

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
	static async list(params) {
		try {
			if (params.hasOwnProperty('body') && params.body.hasOwnProperty('userIds')) {
				const userIds = params.body.userIds

				const userIdsNotFoundInRedis = []
				const userDetailsFoundInRedis = []
				for (let i = 0; i < userIds.length; i++) {
					let userDetails =
						(await utilsHelper.redisGet(common.redisUserPrefix + userIds[i].toString())) || false

					if (!userDetails) {
						userIdsNotFoundInRedis.push(userIds[i])
					} else {
						if (userDetails.image) {
							userDetails['image_cloud_path'] = userDetails.image
							userDetails.image = await utils.getDownloadableUrl(userDetails.image)
						}
						userDetailsFoundInRedis.push(userDetails)
					}
				}

				let filterQuery = {
					id: userIdsNotFoundInRedis,
				}

				let options = {
					attributes: {
						exclude: ['password', 'refresh_tokens'],
					},
				}

				//returning deleted user if internal token is passing
				if (params.headers.internal_access_token) {
					options.paranoid = false
					if (params.query.exclude_deleted_records)
						options.paranoid = params.query.exclude_deleted_records === 'true'
				}

				let users = await userQueries.findAllUserWithOrganization(filterQuery, options)
				let roles = await roleQueries.findAll(
					{},
					{
						attributes: {
							exclude: ['created_at', 'updated_at', 'deleted_at'],
						},
					}
				)

				users.forEach(async (user) => {
					if (user.roles && user.roles.length > 0) {
						let roleData = roles.filter((role) => user.roles.includes(role.id))
						user['user_roles'] = roleData
						// await utilsHelper.redisSet(element._id.toString(), element)
					}
					user.email = emailEncryption.decrypt(user.email)
					if (user.image) {
						user['image_cloud_path'] = user.image
						user.image = await utils.getDownloadableUrl(userDetails.image)
					}
				})

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
					params.searchText
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

	static async changePassword(bodyData, userId) {
		const projection = ['location']
		try {
			const userCredentials = await UserCredentialQueries.findOne({ user_id: userId })
			if (!userCredentials) {
				return responses.failureResponse({
					message: 'USER_DOESNOT_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			const plaintextEmailId = emailEncryption.decrypt(userCredentials.email)

			let user = await userQueries.findOne(
				{ id: userCredentials.user_id, organization_id: userCredentials.organization_id },
				{ attributes: { exclude: projection } }
			)
			if (!user) {
				return responses.failureResponse({
					message: 'USER_DOESNOT_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const verifyOldPassword = utilsHelper.comparePassword(bodyData.oldPassword, userCredentials.password)
			if (!verifyOldPassword) {
				return responses.failureResponse({
					message: 'INCORRECT_OLD_PASSWORD',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const isPasswordSame = bcryptJs.compareSync(bodyData.newPassword, userCredentials.password)
			if (isPasswordSame) {
				return responses.failureResponse({
					message: 'SAME_PASSWORD_ERROR',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			bodyData.newPassword = utilsHelper.hashPassword(bodyData.newPassword)

			const updateParams = { password: bodyData.newPassword, refresh_tokens: [] }

			await userQueries.updateUser(
				{ id: user.id, organization_id: userCredentials.organization_id },
				updateParams
			)
			await UserCredentialQueries.updateUser({ email: userCredentials.email }, { password: bodyData.newPassword })
			await utilsHelper.redisDel(userCredentials.email)

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

			const templateData = await notificationTemplateQueries.findOneEmailTemplate(
				process.env.CHANGE_PASSWORD_TEMPLATE_CODE
			)

			if (templateData) {
				// Push successful registration email to kafka
				const payload = {
					type: common.notificationEmailType,
					email: {
						to: plaintextEmailId,
						subject: templateData.subject,
						body: utilsHelper.composeEmailBody(templateData.body, {
							name: user.name,
						}),
					},
				}
				await kafkaCommunication.pushEmailToKafka(payload)
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
