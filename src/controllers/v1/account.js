/**
 * name : account.js
 * author : Aman
 * created-date : 07-Oct-2021
 * Description : User Account.
 */

// Dependencies
const accountHelper = require('@services/helper/account')
const csv = require('csvtojson')

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
			const createdAccount = await accountHelper.create(params)
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
		try {
			const loggedInAccount = await accountHelper.login(params)
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
	 * @param {string} req.body.loggedInId - user id.
	 * @param {string} req.body.refresh_token - refresh token.
	 * @param {String} req.decodedToken.id - userId.
	 * @returns {JSON} - accounts loggedout.
	 */

	async logout(req) {
		const params = req.body
		params.loggedInId = req.decodedToken.id
		try {
			const loggedOutAccount = await accountHelper.logout(params)
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
		const params = req.body
		try {
			const createdToken = await accountHelper.generateToken(params)
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
			const result = await accountHelper.generateOtp(params)
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
			const result = await accountHelper.resetPassword(params)
			return result
		} catch (error) {
			return error
		}
	}

	/**
	 * Bulk create mentors
	 * @method
	 * @name bulkCreateMentors
	 * @param {Object} req -request data.
	 * @returns {CSV} - created mentors.
	 */
	async bulkCreateMentors(req) {
		try {
			const mentors = await csv().fromString(req.files.mentors.data.toString())
			const createdMentors = await accountHelper.bulkCreateMentors(mentors, req.decodedToken)
			return createdMentors
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
			const result = await accountHelper.acceptTermsAndCondition(req.decodedToken.id)
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
	 * @param {Number} req.pageNo - page no.
	 * @param {Number} req.pageSize - page size limit.
	 * @param {String} req.searchText - search text.
	 * @returns {JSON} - List of user.
	 */
	async list(req) {
		try {
			const result = await accountHelper.list(req)
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
			const roleUpdated = await accountHelper.changeRole(params)
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
			const result = await accountHelper.registrationOtp(params)
			return result
		} catch (error) {
			return error
		}
	}
}
