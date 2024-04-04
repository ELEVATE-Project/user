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
const moment = require('moment')
const { Op } = require('sequelize')

// create user-session
module.exports = class UserSessionsHelper {
	/**
	 * Create a user session.
	 * @param {number} userId - The ID of the user.
	 * @param {string} [refreshToken=''] - Optional. The refresh token associated with the session.
	 * @param {string} [accessToken=''] - Optional. The access token associated with the session.
	 * @param {Object} deviceInfo - Information about the device used for the session.
	 * @returns {Promise<Object>} - A promise that resolves to a success response with the created session details.
	 * @throws {Error} - Throws an error if any issue occurs during the process.
	 */

	static async createUserSession(userId, refreshToken = '', accessToken = '', deviceInfo) {
		try {
			/**
			 * data for user-session creation
			 */
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

			// create userSession
			const userSession = await userSessionsQueries.create(userSessionDetails)

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

	/**
	 * Update a user session.
	 * @param {Object} filter - The filter criteria to select the user session(s) to update.
	 * @param {Object} update - The data to be updated for the user session(s).
	 * @param {Object} [options={}] - Optional. Additional options for the update operation.
	 * @returns {Promise<Object>} - A promise that resolves to a success response with the updated session details.
	 * @throws {Error} - Throws an error if any issue occurs during the process.
	 */

	static async updateUserSession(filter, update, options = {}) {
		try {
			const result = await userSessionsQueries.update(filter, update, options)
			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'USER_SESSION_UPDATED_SUCCESSFULLY',
				result: result,
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * Retrieve user sessions based on user ID, status, limit, and page.
	 * @param {number} userId - The ID of the user.
	 * @param {string} status - The status of the user sessions (e.g., 'ACTIVE', '').
	 * @param {number} limit - The maximum number of user sessions to retrieve per page.
	 * @param {number} page - The page number for pagination.
	 * @param {number} currentSessionId - The id of current session.
	 * @returns {Promise<Object>} - A promise that resolves to the user session details.
	 */

	static async list(userId, status, limit, page, currentSessionId, period = '') {
		try {
			const filter = {
				user_id: userId,
			}
			const offset = (page - 1) * limit

			// If ended at is null, the status can be active. after verification with redis we can confirm
			if (status === common.ACTIVE_STATUS) {
				filter.ended_at = null
			}

			// If front end passes a period
			if (period != '') {
				const periodInSeconds = await utilsHelper.convertDurationToSeconds(period)
				const currentTimeEpoch = moment().unix()
				const threshold = currentTimeEpoch - periodInSeconds
				filter.started_at = { [Op.gte]: threshold }
			}

			// create userSession
			const userSessions = await userSessionsQueries.findAll(filter)
			const activeSessions = []
			const inActiveSessions = []
			const currentSession = []
			for (const session of userSessions) {
				const id = session.id.toString() // Convert ID to string
				const redisData = await utilsHelper.redisGet(id)
				let statusToSend = status
				if (redisData === null) {
					if (status === common.ACTIVE_STATUS) {
						continue // Skip this element if data is not in Redis and status is active
					} else {
						session.ended_at == null
							? (statusToSend = common.EXPIRED_STATUS)
							: (statusToSend = common.INACTIVE_STATUS)
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
					if (responseObj.id == currentSessionId) {
						currentSession.push(responseObj)
					} else {
						activeSessions.push(responseObj)
					}
				} else if (status === '') {
					const responseObj = {
						id: session.id,
						device_info: session.device_info,
						status: statusToSend,
						login_time: session.started_at,
						logout_time: session.ended_at,
					}
					// get current session data
					if (responseObj.id == currentSessionId) {
						currentSession.push(responseObj)
					} else {
						responseObj.status === common.ACTIVE_STATUS
							? activeSessions.push(responseObj)
							: inActiveSessions.push(responseObj)
					}
				}
			}

			const result = [...currentSession, ...activeSessions, ...inActiveSessions]

			// Paginate the result array
			// The response is accumulated from two places. db and redis. So pagination is not possible on the fly
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
			throw error
		}
	}

	/**
	 * Remove user sessions from both database and Redis.
	 * @param {number[]} userSessionIds - An array of user session IDs to be removed.
	 * @returns {Promise<Object>} - A promise that resolves to a success response upon successful removal.
	 */

	static async removeUserSessions(userSessionIds) {
		try {
			// Delete user sessions from Redis
			for (const sessionId of userSessionIds) {
				await utilsHelper.redisDel(sessionId.toString())
			}

			// Update ended_at of user sessions in the database
			const currentTime = Math.floor(Date.now() / 1000) // Current epoch time in seconds
			const updateResult = await userSessionsQueries.update({ id: userSessionIds }, { ended_at: currentTime })

			// Check if the update was successful
			if (updateResult instanceof Error) {
				throw updateResult // Throw error if update failed
			}

			// Return success response
			const result = {}
			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'USER_SESSIONS_REMOVED_SUCCESSFULLY',
				result,
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * Find user sessions based on the provided filter and options.
	 * @param {Object} filter - The filter criteria to find user sessions.
	 * @param {Object} [options={}] - Optional. Additional options for the query.
	 * @returns {Promise<Object[]>} - A promise that resolves to an array of user session objects.
	 * @throws {Error} - Throws an error if any issue occurs during the process.
	 */
	static async findUserSession(filter, options = {}) {
		try {
			return await userSessionsQueries.findAll(filter, options)
		} catch (error) {
			throw error
		}
	}

	/**
	 * Validate the user session token.
	 * @param {string} token - The token to validate.
	 * @returns {Promise<Object>} - A promise that resolves to a success response if the token is valid, otherwise throws an error.
	 * @throws {Error} - Throws an error if the token validation fails.
	 */

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
			if (process.env.ALLOWED_IDLE_TIME != null) {
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

	/**
	 * Update the user session with access token and refresh token, and set the data in Redis.
	 * @param {number} userSessionId - The ID of the user session to update.
	 * @param {string} accessToken - The new access token.
	 * @param {string} refreshToken - The new refresh token.
	 * @returns {Promise<Object>} - A promise that resolves to a success response after updating the user session and setting data in Redis.
	 * @throws {Error} - Throws an error if the update operation fails.
	 */
	static async updateUserSessionAndsetRedisData(userSessionId, accessToken, refreshToken) {
		try {
			// update user-sessions with refresh token and access token
			await this.updateUserSession(
				{
					id: userSessionId,
				},
				{
					token: accessToken,
					refresh_token: refreshToken,
				}
			)

			// save data in redis against session_id, write a function for this
			const redisData = {
				accessToken: accessToken,
				refreshToken: refreshToken,
			}
			/** Allowed idle time set to zero (infinity indicator here)
			 * set TTL of redis to accessTokenExpiry.
			 * Else it will be there in redis permenantly and will affect listing of user sessions
			 */

			let expiryTime = process.env.ALLOWED_IDLE_TIME
			if (process.env.ALLOWED_IDLE_TIME == null) {
				expiryTime = utilsHelper.convertDurationToSeconds(common.accessTokenExpiry)
			}
			const redisKey = userSessionId.toString()
			await utilsHelper.redisSet(redisKey, redisData, expiryTime)

			const result = {}
			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'USER_SESSION_UPDATED_CESSFULLY',
				result,
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * Retrieve the count of active user sessions for a given userId.
	 * @param {number} userId - The ID of the user for which to retrieve active sessions.
	 * @returns {Promise<number>} - A Promise that resolves to the count of active user sessions.
	 * @throws {Error} - If an error occurs while retrieving the count of active user sessions.
	 */
	static async activeUserSessionCounts(userId) {
		try {
			// Define filter criteria
			const filterQuery = {
				user_id: userId,
				ended_at: null,
			}

			// Fetch user sessions based on filter criteria
			const userSessions = await userSessionsQueries.findAll(filterQuery)

			// Initialize count of active sessions
			let activeSession = 0

			// Loop through user sessions and check if each session exists in Redis
			for (const session of userSessions) {
				const id = session.id.toString()
				const redisData = await utilsHelper.redisGet(id)
				if (redisData !== null) {
					activeSession++
				}
			}
			return activeSession
		} catch (error) {
			throw error
		}
	}
}
