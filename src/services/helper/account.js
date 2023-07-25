/**
 * name : account.js
 * author : Aman Gupta
 * created-date : 03-Nov-2021
 * Description : account helper.
 */

// Dependencies
const bcryptJs = require('bcryptjs')
const jwt = require('jsonwebtoken')

const utilsHelper = require('@generics/utils')
const httpStatusCode = require('@generics/http-status')

const common = require('@constants/common')
const usersData = require('@db/users/queries')
const userQueries = require('@database/queries/users')
const organizationQueries = require('@database/queries/organizations')
const notificationTemplateData = require('@db/notification-template/query')
const kafkaCommunication = require('@generics/kafka-communication')
const roleQueries = require('@database/queries/user_roles')
const FILESTREAM = require('@generics/file-stream')

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
	 * @returns {JSON} - returns account creation details.
	 */

	static async create(bodyData) {
		const projection = ['password', 'refresh_token', 'location', 'otpInfo']

		try {
			const email = bodyData.email.toLowerCase()
			let user = await userQueries.findOne({ where: { email: email } })

			if (user) {
				return common.failureResponse({
					message: 'USER_ALREADY_EXISTS',
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
				})
			}

			if (process.env.ENABLE_EMAIL_OTP_VERIFICATION === 'true') {
				const redisData = await utilsHelper.redisGet(email)
				if (!redisData || redisData.otp != bodyData.otp) {
					return common.failureResponse({
						message: 'OTP_INVALID',
						statusCode: httpStatusCode.bad_request,
						responseCode: 'CLIENT_ERROR',
					})
				}
			}

			bodyData.password = utilsHelper.hashPassword(bodyData.password)

			if (!bodyData.organization_id) {
				let organization = await organizationQueries.findOne({}, { limit: 1 })
				bodyData.organization_id = organization.id
			}

			let roles = []
			let role

			if (bodyData.role) {
				role = await roleQueries.findOne({
					where: { title: bodyData.role.toLowerCase(), status: common.activeStatus },
					attributes: {
						exclude: ['createdAt', 'updatedAt', 'deletedAt'],
					},
				})
			} else {
				role = await roleQueries.findOne({ where: { title: common.roleUser } })
			}

			if (!role) {
				return common.failureResponse({
					message: 'ROLE_NOT_FOUND',
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
				})
			}

			roles.push(role.id)
			bodyData.roles = roles
			delete bodyData.role

			await userQueries.create(bodyData)

			/* FLOW STARTED: user login after registration */
			user = await userQueries.findOne({
				where: { email: email },
				attributes: {
					exclude: projection,
				},
			})

			const tokenDetail = {
				data: {
					id: user.id,
					email: user.email,
					name: user.name,
					roles: [role],
				},
			}

			user = user.toJSON()
			user.user_roles = [role]

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

			let refresh_token = new Array()
			refresh_token.push({
				token: refreshToken,
				exp: new Date().getTime() + common.refreshTokenExpiryInMs,
				userId: user.id,
			})

			const update = {
				refresh_token: refresh_token,
				last_logged_in_at: new Date().getTime(),
			}

			const filterQuery = { where: { id: user.id } }

			await userQueries.updateUser(update, filterQuery)
			await utilsHelper.redisDel(email)

			const result = { access_token: accessToken, refresh_token: refreshToken, user }
			const templateData = await notificationTemplateData.findOneEmailTemplate(
				process.env.REGISTRATION_EMAIL_TEMPLATE_CODE
			)

			if (templateData) {
				// Push successfull registration email to kafka
				const payload = {
					type: common.notificationEmailType,
					email: {
						to: email,
						subject: templateData.subject,
						body: utilsHelper.composeEmailBody(templateData.body, {
							name: bodyData.name,
							appName: process.env.APP_NAME,
						}),
					},
				}

				await kafkaCommunication.pushEmailToKafka(payload)
			}

			return common.successResponse({
				statusCode: httpStatusCode.created,
				message: 'USER_CREATED_SUCCESSFULLY',
				result,
			})
		} catch (error) {
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
	 * @returns {JSON} - returns susccess or failure of login details.
	 */

	static async login(bodyData) {
		try {
			let user = await userQueries.findOne({
				where: { email: bodyData.email.toLowerCase() },
			})
			if (!user) {
				return common.failureResponse({
					message: 'EMAIL_ID_NOT_REGISTERED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			let roles = await roleQueries.findAll({
				where: { id: user.roles, status: common.activeStatus },
				attributes: {
					exclude: ['createdAt', 'updatedAt', 'deletedAt'],
				},
			})
			if (!roles) {
				return common.failureResponse({
					message: 'ROLE_NOT_FOUND',
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
				})
			}

			user = user.toJSON()
			user.user_roles = roles

			const isPasswordCorrect = bcryptJs.compareSync(bodyData.password, user.password)
			if (!isPasswordCorrect) {
				return common.failureResponse({
					message: 'USERNAME_OR_PASSWORD_IS_INVALID',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const tokenDetail = {
				data: {
					id: user.id,
					email: user.email,
					name: user.name,
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

			let currentToken = {
				token: refreshToken,
				exp: new Date().getTime() + common.refreshTokenExpiryInMs,
				userId: user.id,
			}

			let userTokens = user.refresh_token ? user.refresh_token : []
			let noOfTokensToKeep = common.refreshTokenLimit - 1
			let refreshTokens = []

			if (userTokens && userTokens.length >= common.refreshTokenLimit) {
				refreshTokens = userTokens.splice(-noOfTokensToKeep)
			} else {
				refreshTokens = userTokens
			}

			refreshTokens.push(currentToken)

			const updateParams = {
				refresh_token: refreshTokens,
				last_logged_in_at: new Date().getTime(),
			}

			const filterQuery = { where: { id: user.id } }

			await userQueries.updateUser(updateParams, filterQuery)

			delete user.password
			delete user.refresh_token

			const result = { access_token: accessToken, refresh_token: refreshToken, user }

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'LOGGED_IN_SUCCESSFULLY',
				result,
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * logout user account
	 * @method
	 * @name logout
	 * @param {Object} req -request data.
	 * @param {string} bodyData.loggedInId - user id.
	 * @param {string} bodyData.refreshToken - refresh token.
	 * @returns {JSON} - returns accounts loggedout information.
	 */

	static async logout(bodyData) {
		try {
			const user = await userQueries.findByPk(bodyData.loggedInId)
			if (!user) {
				return common.failureResponse({
					message: 'USER_NOT_FOUND',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}

			let refreshTokens = user.refresh_token ? user.refresh_token : []
			refreshTokens = refreshTokens.filter(function (tokenData) {
				return tokenData.token !== bodyData.refreshToken
			})

			/* Destroy refresh token for user */
			const res = await userQueries.updateUser({ refresh_token: refreshTokens }, { where: { id: user.id } })

			/* If user doc not updated because of stored token does not matched with bodyData.refreshToken */
			if (!res) {
				return common.failureResponse({
					message: 'INVALID_REFRESH_TOKEN',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'LOGGED_OUT_SUCCESSFULLY',
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * generate token
	 * @method
	 * @name generateToken
	 * @param {Object} bodyData -request data.
	 * @param {string} bodyData.refreshToken - refresh token.
	 * @returns {JSON} - returns access token info
	 */

	static async generateToken(bodyData) {
		let decodedToken
		try {
			decodedToken = jwt.verify(bodyData.refreshToken, process.env.REFRESH_TOKEN_SECRET)
		} catch (error) {
			/* If refresh token is expired */
			error.statusCode = httpStatusCode.unauthorized
			error.message = 'REFRESH_TOKEN_EXPIRED'
			throw error
		}

		const user = await userQueries.findOne({ where: { id: decodedToken.data.id } })

		/* Check valid user */
		if (!user) {
			return common.failureResponse({
				message: 'USER_DOESNOT_EXISTS',
				statusCode: httpStatusCode.bad_request,
				responseCode: 'CLIENT_ERROR',
			})
		}

		if (user.deleted) {
			return common.failureResponse({
				message: 'UNAUTHORIZED_REQUEST',
				statusCode: httpStatusCode.unauthorized,
				responseCode: 'UNAUTHORIZED',
			})
		}

		/* Check valid refresh token stored in db */
		if (user.refresh_token.length) {
			const token = user.refresh_token.find((tokenData) => tokenData.token === bodyData.refreshToken)
			if (!token) {
				return common.failureResponse({
					message: 'REFRESH_TOKEN_NOT_FOUND',
					statusCode: httpStatusCode.internal_server_error,
					responseCode: 'CLIENT_ERROR',
				})
			}

			/* Generate new access token */
			const accessToken = utilsHelper.generateToken(
				{ data: decodedToken.data },
				process.env.ACCESS_TOKEN_SECRET,
				common.accessTokenExpiry
			)

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'ACCESS_TOKEN_GENERATED_SUCCESSFULLY',
				result: { access_token: accessToken },
			})
		}
		return common.failureResponse({
			message: 'REFRESH_TOKEN_NOT_FOUND',
			statusCode: httpStatusCode.bad_request,
			responseCode: 'CLIENT_ERROR',
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
			let otp
			let isValidOtpExist = true
			const user = await userQueries.findOne({ where: { email: bodyData.email } })
			if (!user) {
				return common.failureResponse({
					message: 'USER_DOESNOT_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const userData = await utilsHelper.redisGet(bodyData.email.toLowerCase())

			if (userData && userData.action === 'forgetpassword') {
				otp = userData.otp // If valid then get previuosly generated otp
				console.log(otp)
			} else {
				isValidOtpExist = false
			}

			const isPasswordCorrect = bcryptJs.compareSync(bodyData.password, user.password)
			if (isPasswordCorrect) {
				return common.failureResponse({
					message: 'RESET_PREVIOUS_PASSWORD',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			if (!isValidOtpExist) {
				otp = Math.floor(Math.random() * 900000 + 100000) // 6 digit otp
				const redisData = {
					verify: bodyData.email.toLowerCase(),
					action: 'forgetpassword',
					otp,
				}
				const res = await utilsHelper.redisSet(
					bodyData.email.toLowerCase(),
					redisData,
					common.otpExpirationTime
				)
				if (res !== 'OK') {
					return common.failureResponse({
						message: 'UNABLE_TO_SEND_OTP',
						statusCode: httpStatusCode.internal_server_error,
						responseCode: 'SERVER_ERROR',
					})
				}
			}

			const templateData = await notificationTemplateData.findOneEmailTemplate(
				process.env.OTP_EMAIL_TEMPLATE_CODE
			)

			if (templateData) {
				// Push otp to kafka
				const payload = {
					type: common.notificationEmailType,
					email: {
						to: bodyData.email,
						subject: templateData.subject,
						body: utilsHelper.composeEmailBody(templateData.body, { name: user.name, otp }),
					},
				}

				await kafkaCommunication.pushEmailToKafka(payload)
			}

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'OTP_SENT_SUCCESSFULLY',
			})
		} catch (error) {
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
		try {
			let otp
			let isValidOtpExist = true
			const user = await usersData.findOne({ 'email.address': bodyData.email })
			if (user) {
				return common.failureResponse({
					message: 'USER_ALREADY_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const userData = await utilsHelper.redisGet(bodyData.email.toLowerCase())

			if (userData && userData.action === 'signup') {
				otp = userData.otp // If valid then get previuosly generated otp
			} else {
				isValidOtpExist = false
			}

			if (!isValidOtpExist) {
				otp = Math.floor(Math.random() * 900000 + 100000) // 6 digit otp
				const redisData = {
					verify: bodyData.email.toLowerCase(),
					action: 'signup',
					otp,
				}
				const res = await utilsHelper.redisSet(
					bodyData.email.toLowerCase(),
					redisData,
					common.otpExpirationTime
				)
				if (res !== 'OK') {
					return common.failureResponse({
						message: 'UNABLE_TO_SEND_OTP',
						statusCode: httpStatusCode.internal_server_error,
						responseCode: 'SERVER_ERROR',
					})
				}
			}

			const templateData = await notificationTemplateData.findOneEmailTemplate(
				process.env.REGISTRATION_OTP_EMAIL_TEMPLATE_CODE
			)

			if (templateData) {
				// Push otp to kafka
				const payload = {
					type: common.notificationEmailType,
					email: {
						to: bodyData.email,
						subject: templateData.subject,
						body: utilsHelper.composeEmailBody(templateData.body, { name: bodyData.name, otp }),
					},
				}

				await kafkaCommunication.pushEmailToKafka(payload)
			}
			if (process.env.APPLICATION_ENV === 'development') {
				console.log(otp)
			}
			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'REGISTRATION_OTP_SENT_SUCCESSFULLY',
			})
		} catch (error) {
			throw error
		}
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

	static async resetPassword(bodyData) {
		const projection = ['location']
		try {
			let user = await userQueries.findOne({
				where: { email: bodyData.email },
				attributes: {
					exclude: projection,
				},
			})
			if (!user) {
				return common.failureResponse({
					message: 'USER_DOESNOT_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			let roles = await roleQueries.findAll({ where: { id: user.roles, status: common.activeStatus } })
			if (!roles) {
				return common.failureResponse({
					message: 'ROLE_NOT_FOUND',
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
				})
			}

			user = user.toJSON()
			user.user_roles = roles

			const redisData = await utilsHelper.redisGet(bodyData.email.toLowerCase())
			if (!redisData || redisData.otp != bodyData.otp) {
				return common.failureResponse({
					message: 'RESET_OTP_INVALID',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			const isPasswordCorrect = bcryptJs.compareSync(bodyData.password, user.password)
			if (isPasswordCorrect) {
				return common.failureResponse({
					message: 'RESET_PREVIOUS_PASSWORD',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const salt = bcryptJs.genSaltSync(10)
			bodyData.password = bcryptJs.hashSync(bodyData.password, salt)

			const tokenDetail = {
				data: {
					id: user.id,
					email: user.email,
					name: user.name,
					role: roles,
				},
			}

			const accessToken = utilsHelper.generateToken(tokenDetail, process.env.ACCESS_TOKEN_SECRET, '1d')
			const refreshToken = utilsHelper.generateToken(tokenDetail, process.env.REFRESH_TOKEN_SECRET, '183d')

			let currentToken = {
				token: refreshToken,
				exp: new Date().getTime() + common.refreshTokenExpiryInMs,
				userId: user.id,
			}

			let userTokens = user.refresh_token ? user.refresh_token : []
			let noOfTokensToKeep = common.refreshTokenLimit - 1
			let refreshTokens = []

			if (userTokens && userTokens.length >= common.refreshTokenLimit) {
				refreshTokens = userTokens.splice(-noOfTokensToKeep)
			} else {
				refreshTokens = userTokens
			}

			refreshTokens.push(currentToken)
			const updateParams = {
				refresh_token: refreshTokens,
				lastLoggedInAt: new Date().getTime(),
				password: bodyData.password,
			}

			const filterQuery = { where: { id: user.id } }
			await userQueries.updateUser(updateParams, filterQuery)
			await utilsHelper.redisDel(bodyData.email.toLowerCase())

			/* Mongoose schema is in strict mode, so can not delete otpInfo directly */
			delete user.password
			delete user.otpInfo

			const result = { access_token: accessToken, refresh_token: refreshToken, user }

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'PASSWORD_RESET_SUCCESSFULLY',
				result,
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * Bulk create mentors
	 * @method
	 * @name bulkCreateMentors
	 * @param {Array} mentors - mentor details.
	 * @param {Object} tokenInformation - token details.
	 * @returns {CSV} - created mentors.
	 */
	static async bulkCreateMentors(mentors, tokenInformation) {
		try {
			const systemUser = await systemUserData.findUsersByEmail(tokenInformation.email)

			if (!systemUser) {
				return common.failureResponse({
					message: 'USER_DOESNOT_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			if (systemUser.role.toLowerCase() !== 'admin') {
				return common.failureResponse({
					message: 'NOT_AN_ADMIN',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const fileName = 'mentors-creation'
			let fileStream = new FILESTREAM(fileName)
			let input = fileStream.initStream()

			;(async function () {
				await fileStream.getProcessorPromise()
				return {
					isResponseAStream: true,
					fileNameWithPath: fileStream.fileNameWithPath(),
				}
			})()

			for (const mentor of mentors) {
				mentor.isAMentor = true
				const data = await this.create(mentor)
				mentor.email = mentor.email.address
				mentor.status = data.message
				input.push(mentor)
			}

			input.push(null)
		} catch (error) {
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
					let userDetails = (await utilsHelper.redisGet(userIds[i])) || false

					if (!userDetails) {
						userIdsNotFoundInRedis.push(userIds[i])
					} else {
						userDetailsFoundInRedis.push(userDetails)
					}
				}

				let filterQuery = {
					_id: { $in: userIdsNotFoundInRedis },
					deleted: false,
				}

				//returning deleted user if internal token is passing
				if (params.headers.internal_access_token) {
					delete filterQuery.deleted
				}

				const users = await usersData.findAllUsers(filterQuery, { password: 0, refreshTokens: 0, otpInfo: 0 })

				users.forEach(async (element) => {
					if (element.isAMentor) {
						await utilsHelper.redisSet(element._id.toString(), element)
					}
				})

				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'USERS_FETCHED_SUCCESSFULLY',
					result: [...users, ...userDetailsFoundInRedis],
				})
			} else {
				let users = await usersData.listUsers(
					params.query.type,
					params.pageNo,
					params.pageSize,
					params.searchText
				)
				let message = ''
				if (params.query.type === 'mentor') {
					message = 'MENTOR_LIST'
				} else if (params.query.type === 'mentee') {
					message = 'MENTEE_LIST'
				}

				if (users[0].data.length < 1) {
					return common.successResponse({
						statusCode: httpStatusCode.ok,
						message: message,
						result: {
							data: [],
							count: 0,
						},
					})
				}

				let foundKeys = {}
				let result = []

				/* Required to resolve all promises first before preparing response object else sometime 
                it will push unresolved promise object if you put this logic in below for loop */

				await Promise.all(
					users[0].data.map(async (user) => {
						/* Assigned image url from the stored location */
						if (user.image) {
							user.image = await utilsHelper.getDownloadableUrl(user.image)
						}
						return user
					})
				)

				for (let user of users[0].data) {
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

				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: message,
					result: {
						data: result,
						count: users[0].count,
					},
				})
			}
		} catch (error) {
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
	static async acceptTermsAndCondition(userId) {
		try {
			const user = await userQueries.findByPk(userId)

			if (!user) {
				return common.failureResponse({
					message: 'USER_DOESNOT_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			if (user.deleted) {
				return common.failureResponse({
					message: 'UNAUTHORIZED_REQUEST',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}

			await userQueries.updateUser({ has_accepted_terms_and_conditions: true }, { where: { id: userId } })
			await utilsHelper.redisDel(user.email)
			// await utils.redisDel(userId)

			return common.successResponse({
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
			let role = await roleQueries.findOne({ where: { name: bodyData.role.toLowerCase() } })
			if (!role) {
				return common.failureResponse({
					message: 'ROLE_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const res = await userQueries.updateUser({ role_id: role.id }, { where: { email: bodyData.email } })
			/* If user doc not updated  */
			if (!res) {
				return common.failureResponse({
					message: 'USER_DOESNOT_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'USER_ROLE_UPDATED_SUCCESSFULLY',
			})
		} catch (error) {
			throw error
		}
	}
}
