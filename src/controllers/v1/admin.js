/**
 * name : admin.js
 * author : Priyanka Pradeep
 * created-date : 16-Jun-2023
 * Description : User admin
 */

// Dependencies
const adminHelper = require('@services/helper/admin')
const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')

module.exports = class Admin {
	/**
	 * Delete user
	 * @method
	 * @name deleteUser
	 * @param {String} req.params._id -userId.
	 * @returns {JSON} - delete user response
	 */

	async deleteUser(req) {
		try {
			if (!req.decodedToken.role && req.body.role != common.roleAdmin) {
				throw common.failureResponse({
					message: 'USER_IS_NOT_A_ADMIN',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const user = await adminHelper.deleteUser(req.params.id)
			return user
		} catch (error) {
			return error
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

	async create(req) {
		try {
			if (req.body.secretCode != process.env.ADMIN_SECRET_CODE) {
				throw common.failureResponse({
					message: 'INVALID_SECRET_CODE',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			const createdAccount = await adminHelper.create(req.body)
			return createdAccount
		} catch (error) {
			return error
		}
	}

	/**
	 * login admin user
	 * @method
	 * @name login
	 * @param {Object} bodyData - user login data.
	 * @param {string} bodyData.email - email.
	 * @param {string} bodyData.password - email.
	 * @returns {JSON} - returns login response
	 */

	async login(req) {
		try {
			const loggedInAccount = await adminHelper.login(req.body)
			return loggedInAccount
		} catch (error) {
			return error
		}
	}
}
