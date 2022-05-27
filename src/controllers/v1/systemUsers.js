/**
 * name : systemUsers.js
 * author : Aman
 * created-date : 10-Nov-2021
 * Description : System User Create account.
 */

// Dependencies
const systemUsersHelper = require('../../services/helper/systemUsers')

module.exports = class SystemUsers {
	/**
	 * create system users
	 * @method
	 * @name create
	 * @param {Object} bodyData - user create information
	 * @param {string} bodyData.email - email.
	 * @param {string} bodyData.password - email.
	 * @returns {JSON} - returns created user information
	 */

	async create(req) {
		const params = req.body
		try {
			const createdAccount = await systemUsersHelper.create(params)
			return createdAccount
		} catch (error) {
			return error
		}
	}

	/**
	 * login system user
	 * @method
	 * @name login
	 * @param {Object} bodyData - user login data.
	 * @param {string} bodyData.email - email.
	 * @param {string} bodyData.password - email.
	 * @returns {JSON} - returns login response
	 */

	async login(req) {
		const params = req.body
		try {
			const loggedInAccount = await systemUsersHelper.login(params)
			return loggedInAccount
		} catch (error) {
			return error
		}
	}
}
