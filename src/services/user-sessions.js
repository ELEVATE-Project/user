/**
 * name         : services/user-sessions.js
 * author       : Vishnu
 * created-date : 26-Mar-2024
 * Description  : user-sessions business logic.
 */

// Dependencies
const userSessionsQueries = require('@database/queries/user-sessions')
const httpStatusCode = require('@generics/http-status')
const responses = require('@helpers/responses')

// create user-session
module.exports = class UserSessionsHelper {
	static async createUserSession(userId, refreshToken = '', accessToken = '', deviceInfo) {
		try {
			const userSessionDetails = {
				user_id: userId,
				device_info: deviceInfo,
				started_at: Date.now(),
			}
			if (accessToken !== '') {
				userSessionDetails.token = accessToken
			}
			if (accessToken !== '') {
				userSessionDetails.refresh_token = refreshToken
			}
			console.log('user sessions details : ', userSessionDetails)
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
}

// update-user session
// add entry to redis
// update user session entry in redis
