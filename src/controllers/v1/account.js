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
	 * @param {Object} req.body -request body contains user creation deatils.
	 * @param {String} req.body.name - name of the user.
	 * @param {Boolean} req.body.role - mentor or mentee .
	 * @param {String} req.body.email - user email.
	 * @param {String} req.body.password - user password.
	 * @returns {JSON} - response contains account creation details.
	 */

	async create(req) {
		const params = req.body
		try {
			const createdAccount = await accountService.create(params)
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
		const device_info = req.headers && req.headers['device-info'] ? req.headers['device-info'] : {}
		try {
			const loggedInAccount = await accountService.login(params, device_info)
			return loggedInAccount
		} catch (error) {
			return error
		}
	}

	/**
	 * logout user account
	 * @method
	 * @name logout
	 * @param {Object} req -request data.
	 * @param {Object} req.decodedToken - it contains user token informations.
	 * @param {string} req.body.refresh_token - refresh token.
	 * @param {String} req.decodedToken.id - userId.
	 * @returns {JSON} - accounts loggedout.
	 */

	async logout(req) {
		try {
			const loggedOutAccount = await accountService.logout(
				req.body,
				req.decodedToken.id,
				req.decodedToken.organization_id
			)
			return loggedOutAccount
		} catch (error) {
			return error
		}
	}

	/**
	 * generate access token
	 * @method
	 * @name generateToken
	 * @param {Object} req -request data.
	 * @param {string} req.body.refresh_token - refresh token.
	 * @returns {JSON} - access token info
	 */

	async generateToken(req) {
		try {
			const createdToken = await accountService.generateToken(req.body)
			return createdToken
		} catch (error) {
			return error
		}
	}

	/**
	 * generate otp
	 * @method
	 * @name generateOtp
	 * @param {Object} req -request data.
	 * @param {string} req.body.email - user email.
	 * @returns {JSON} - otp success response
	 */

	async generateOtp(req) {
		const params = req.body
		try {
			const result = await accountService.generateOtp(params)
			return result
		} catch (error) {
			return error
		}
	}

	/**
	 * Reset password
	 * @method
	 * @name resetPassword
	 * @param {Object} req -request data.
	 * @param {string} req.body.email - user email.
	 * @param {string} req.body.otp - user otp.
	 * @param {string} req.body.password - user password.
	 * @returns {JSON} - password reset response
	 */

	async resetPassword(req) {
		const params = req.body
		try {
			const result = await accountService.resetPassword(params)
			return result
		} catch (error) {
			return error
		}
	}

	/**
	 * Accept term and condition
	 * @method
	 * @name acceptTermsAndCondition
	 * @param {Object} req -request data.
	 * @param {Object} req.decodedToken.id - userId.
	 * @returns {JSON} - accept the term and condition
	 */
	async acceptTermsAndCondition(req) {
		try {
			const result = await accountService.acceptTermsAndCondition(
				req.decodedToken.id,
				req.decodedToken.organization_id
			)
			return result
		} catch (error) {
			return error
		}
	}

	/**
	 * Account List
	 * @method
	 * @name list
	 * @param {Object} req -request data with method POST.
	 * @param {Object} req.body -request body contains user deatils.
	 * @param {Array} req.body.userIds -contains userIds.
	 * @returns {JSON} - all accounts data
	 *
	 * @param {Object} req - request data with method GET.
	 * @param {Boolean} req.query.type - User Type mentor/mentee
	 * @param {Integer} req.query.organization_id - User Organization id
	 * @param {Number} req.pageNo - page no.
	 * @param {Number} req.pageSize - page size limit.
	 * @param {String} req.searchText - search text.
	 * @returns {JSON} - List of user.
	 */
	async list(req) {
		try {
			const result = await accountService.list(req)
			return result
		} catch (error) {
			return error
		}
	}

	/**
	 * change role of user
	 * @method
	 * @name changeRole
	 * @param {Object} req -request data.
	 * @param {string} req.body.email - email
	 * @param {string} req.body.role - role
	 * @returns {JSON} access token info
	 */

	async changeRole(req) {
		const params = req.body
		try {
			const roleUpdated = await accountService.changeRole(params)
			return roleUpdated
		} catch (error) {
			return error
		}
	}

	/**
	 * otp to verify user during registration
	 * @method
	 * @name registrationOtp
	 * @param {Object} req -request data.
	 * @param {String} req.body.email - user email.
	 * @returns {JSON} - otp success response
	 */

	async registrationOtp(req) {
		const params = req.body
		try {
			const result = await accountService.registrationOtp(params)
			return result
		} catch (error) {
			return error
		}
	}

	/**
	 * Account Search
	 * @method
	 * @name list
	 * @param {Object} req -request data with method POST.
	 * @param {Object} req.body -request body contains user deatils.
	 * @param {Array} req.body.userIds -contains userIds.
	 * @returns {JSON} - all accounts data
	 * @param {Object} req - request data with method GET.
	 * @param {Boolean} req.query.type - User Type mentor/mentee
	 * @param {Integer} req.query.organization_id - User Organization id
	 * @param {Number} req.pageNo - page no.
	 * @param {Number} req.pageSize - page size limit.
	 * @param {String} req.searchText - search text.
	 * @returns {JSON} - List of user.
	 */
	async search(req) {
		try {
			const result = await accountService.search(req)
			return result
		} catch (error) {
			return error
		}
	}

	/**
	 * change password
	 * @method
	 * @name changePassword
	 * @param {Object} req -request data.
	 * @param {Object} req.decodedToken.id - UserId.
	 * @param {string} req.body - request body contains user password
	 * @param {string} req.body.OldPassword - user Old Password.
	 * @param {string} req.body.NewPassword - user New Password.
	 * @param {string} req.body.ConfirmNewPassword - user Confirming New Password.
	 * @returns {JSON} - password changed response
	 */

	async changePassword(req) {
		try {
			const result = await accountService.changePassword(req.body, req.decodedToken.id)
			return result
		} catch (error) {
			return error
		}
	}
}
