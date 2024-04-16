/**
 * name : account.js
 * author : Aman
 * created-date : 07-Oct-2021
 * Description : User Account.
 */

// Dependencies
const accountService = require('@services/account')
module.exports = class Account {
	/**
	 * create mentee account
	 * @method
	 * @name create
	 * @param {Object} req -request data.
	 * @param {Object} req.body -request body contains user creation details.
	 * @param {String} req.body.name - name of the user.
	 * @param {String} req.body.email - user email.
	 * @param {String} req.body.password - user password.
	 * @returns {JSON} - response contains account creation details.
	 */

	async create(req) {
		const params = req.body
		const device_info = req.headers && req.headers['device-info'] ? JSON.parse(req.headers['device-info']) : {}
		try {
			const createdAccount = await accountService.create(params, device_info)
			return createdAccount
		} catch (error) {
			return error
		}
	}

	/**
	 * login user account
	 * @method
	 * @name login
	 * @param {Object} req -request data.
	 * @param {Object} req.body -request body contains user login deatils.
	 * @param {String} req.body.email - user email.
	 * @param {String} req.body.password - user password.
	 * @returns {JSON} - returns susccess or failure of login details.
	 */

	async login(req) {
		const params = req.body
		const device_info = req.headers && req.headers['device-info'] ? JSON.parse(req.headers['device-info']) : {}
		try {
			const loggedInAccount = await accountService.login(params, device_info)
			return loggedInAccount
		} catch (error) {
			return error
		}
	}
}
