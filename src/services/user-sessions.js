/**
 * name         : services/user-sessions.js
 * author       : Vishnu
 * created-date : 26-Mar-2024
 * Description  : user-sessions business logic.
 */

// Dependencies
const userSessionsQueries = require('@database/queries/user-sessions')
const utilsHelper = require('@generics/utils')
const httpStatusCode = require('@generics/http-status')
const responses = require('@helpers/responses')
const common = require('@constants/common')
const jwt = require('jsonwebtoken')

// create user-session
module.exports = class UserSessionsHelper {
	static async createUserSession(userId, refreshToken = '', accessToken = '', deviceInfo) {
		try {
			const userSessionDetails = {
				user_id: userId,
				device_info: deviceInfo,
				started_at: Math.floor(new Date().getTime() / 1000),
			}
			if (accessToken !== '') {
				userSessionDetails.token = accessToken
			}
			if (accessToken !== '') {
				userSessionDetails.refresh_token = refreshToken
			}
			console.log('user sessions details >>>>>>>>>>>>>>>>>>>>>>>%%%%%%%%%%%%%: ', userSessionDetails)
			// create userSession
			const userSession = await userSessionsQueries.create(userSessionDetails)

			console.log('userSessions : ', userSession)

			return responses.successResponse({
				statusCode: httpStatusCode.created,
				message: 'USER_SESSION_CREATED_SUCCESSFULLY',
				result: userSession,
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	static async updateUserSession(filter, update, options = {}) {
		try {
			const result = await userSessionsQueries.update(filter, update, options)
			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'USER_SESSION_UPDATED_SUCCESSFULLY',
				result: result,
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	/**
	 * Retrieve user sessions based on user ID, status, limit, and page.
	 * @param {number} userId - The ID of the user.
	 * @param {string} status - The status of the user sessions (e.g., 'ACTIVE', '').
	 * @param {number} limit - The maximum number of user sessions to retrieve per page.
	 * @param {number} page - The page number for pagination.
	 * @returns {Promise<Object>} - A promise that resolves to the user session details.
	 */

	static async list(userId, status, limit, page) {
		try {
			const filter = {
				user_id: userId,
			}
			const offset = (page - 1) * limit

			// If ended at is null, the status can be active. after verification with redis we can confirm
			if (status === common.ACTIVE_STATUS) {
				filter.ended_at = null
			}

			// create userSession
			const userSessions = await userSessionsQueries.findAll(filter)
			const activeSessions = []
			const inActiveSessions = []
			for (const session of userSessions) {
				const id = session.id.toString() // Convert ID to string
				const redisData = await utilsHelper.redisGet(id)
				let statusToSend = status
				if (redisData === null) {
					if (status === common.ACTIVE_STATUS) {
						continue // Skip this element if data is not in Redis and status is active
					} else {
						statusToSend = common.INACTIVE_STATUS
					}
				} else {
					statusToSend = common.ACTIVE_STATUS
				}

				if (status === common.ACTIVE_STATUS && statusToSend === common.ACTIVE_STATUS) {
					const responseObj = {
						id: session.id,
						device_info: session.device_info,
						status: statusToSend,
						login_time: session.started_at,
						logout_time: session.ended_at,
					}
					activeSessions.push(responseObj)
				} else if (status === '') {
					const responseObj = {
						id: session.id,
						device_info: session.device_info,
						status: statusToSend,
						login_time: session.started_at,
						logout_time: session.ended_at,
					}
					responseObj.status === common.ACTIVE_STATUS
						? activeSessions.push(responseObj)
						: inActiveSessions.push(responseObj)
				}
			}
			console.log('activeSessions : ', activeSessions)
			console.log('inActiveSessions : ', inActiveSessions)

			const result = [...activeSessions, ...inActiveSessions]

			// Paginate the result array
			const paginatedResult = result.slice(offset, offset + limit)

			return responses.successResponse({
				statusCode: httpStatusCode.created,
				message: 'USER_SESSION_FETCHED_SUCCESSFULLY',
				result: {
					data: paginatedResult,
					count: result.length,
				},
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	static async validateUserSession(token) {
		// token validation failure message
		const unAuthorizedResponse = responses.failureResponse({
			message: 'UNAUTHORIZED_REQUEST',
			statusCode: httpStatusCode.unauthorized,
			responseCode: 'UNAUTHORIZED',
		})

		const tokenArray = token.split(' ')

		// If not bearer throw error
		if (tokenArray[0] !== 'bearer') {
			throw unAuthorizedResponse
		}
		try {
			const decodedToken = jwt.verify(tokenArray[1], process.env.ACCESS_TOKEN_SECRET)
			const sessionId = decodedToken.data.session_id.toString()

			const redisData = await utilsHelper.redisGet(sessionId)

			// If data is not in redis, token is invalid
			if (!redisData || redisData.accessToken !== tokenArray[1]) {
				throw unAuthorizedResponse
			}

			// Renew the TTL if allowed idle is not infinite
			if (process.env.ALLOWED_IDLE_TIME == null) {
				await utilsHelper.redisSet(sessionId, redisData, process.env.ALLOWED_IDLE_TIME)
			}

			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'USER_SESSION_VALIDATED_SUCCESSFULLY',
				result: {
					data: {
						user_session_active: true,
					},
				},
			})
		} catch (err) {
			throw unAuthorizedResponse
		}
	}
}

// update-user session
// add entry to redis
// update user session entry in redis
