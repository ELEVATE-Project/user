/**
 * name : userRole.js
 * author : Priyanka Pradeep
 * created-date : 21-July-2023
 * Description : UserRole Service Helper.
 */

// Dependencies

const httpStatusCode = require('@generics/http-status')
const roleQueries = require('@database/queries/userRole')
const common = require('@constants/common')

module.exports = class userRoleHelper {
	/**
	 * list Roles
	 * @method
	 * @name list
	 * @returns {JSON} - delete user response
	 */
	static async list() {
		try {
			let roles = await roleQueries.findAll()

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'USER_ROLE_LIST',
				result: roles,
			})
		} catch (error) {
			throw error
		}
	}
}
