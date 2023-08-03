/**
 * name : userRole.js
 * author : Priyanka Pradeep
 * created-date : 21-Jun-2023
 * Description : User roles
 */

// Dependencies
const roleHelper = require('@services/helper/userRole')

module.exports = class userRole {
	/**
	 * list roles
	 * @method
	 * @name list
	 * @returns {JSON} - list of roles
	 */

	async list(req) {
		try {
			const user = await roleHelper.list()
			return user
		} catch (error) {
			return error
		}
	}
}
