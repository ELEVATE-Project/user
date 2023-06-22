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
}
