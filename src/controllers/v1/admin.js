/**
 * name : admin.js
 * author : Nevil Mathew
 * created-date : 21-JUN-2023
 * Description : Admin Controller.
 */

// Dependencies
const userHelper = require('@services/helper/admin')

module.exports = class admin {
	/**
	 * userDelete
	 * @method
	 * @name userDelete
	 * @param {Object} req -request data.
	 * @param {String} req.query.userId - User Id.
	 * @returns {JSON} - Success Response.
	 */

	async userDelete(req) {
		try {
			const userDelete = await userHelper.userDelete(req.decodedToken, req.query.userId)
			return userDelete
		} catch (error) {
			return error
		}
	}
}
