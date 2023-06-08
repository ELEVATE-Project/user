/**
 * name : services/helper/systemUsers.js
 * author : Aman
 * created-date : 02-Nov-2021
 * Description : system user Service Helper.
 */

// Dependencies
const utilsHelper = require('@generics/utils')
const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const systemUserData = require('../../database/queries/system_users')


module.exports = class SystemUsersHelper {
	/**
	 * create system users
	 * @method
	 * @name create
	 * @param {Object} bodyData - user create information
	 * @param {string} bodyData.email - email.
	 * @param {string} bodyData.password - email.
	 * @returns {JSON} - returns created user information
	 */
	static async create(bodyData) {
		try {

			const email = bodyData.email
			const user = await systemUserData.findUsersByEmail(email)

			if (user) {
				return common.failureResponse({
					message: 'SYSTEM_USER_ALREADY_EXISTS',
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
				})
			}

			bodyData.password = utilsHelper.hashPassword(bodyData.password)
			await systemUserData.create(bodyData)
			return common.successResponse({
				statusCode: httpStatusCode.created,
				message: 'USER_CREATED_SUCCESSFULLY',
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * login user
	 * @method
	 * @name login
	 * @param {Object} bodyData - user login data.
	 * @param {string} bodyData.email - email.
	 * @param {string} bodyData.password - email.
	 * @returns {JSON} - returns login response
	 */
	static async login(bodyData) {
		try {
			let user = await systemUserData.findUsersByEmail(bodyData.email)
			if (!user) {
				return common.failureResponse({
					message: 'USER_DOESNOT_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			const isPasswordCorrect = utilsHelper.comparePassword(bodyData.password, user.password)
			if (!isPasswordCorrect) {
				return common.failureResponse({
					message: 'PASSWORD_INVALID',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const tokenDetail = {
				data: {
					_id: user._id,
					email: user.email.address,
					role: user.role,
				},
			}

			const accessToken = utilsHelper.generateToken(tokenDetail, process.env.ACCESS_TOKEN_SECRET, '1d')
			const refreshToken = utilsHelper.generateToken(tokenDetail, process.env.REFRESH_TOKEN_SECRET, '183d')

			delete user.password
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
}
