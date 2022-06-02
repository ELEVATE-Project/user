const emailHelper = require('../../services/helper/email')

module.exports = class Email {
	/**
	 * create mentee account
	 * @method
	 * @name create
	 * @param {Object} req -request data.
	 * @param {Object} req.body -request body contains user creation deatils.
	 * @param {String} req.body.secretCode - secrate code to create mentor.
	 * @param {String} req.body.name - name of the user.
	 * @param {Boolean} req.body.isAMentor - is a mentor or not .
	 * @param {String} req.body.email - user email.
	 * @param {String} req.body.password - user password.
	 * @returns {JSON} - response contains account creation details.
	 */

	async send(req) {
		try {
			const sendEmail = await emailHelper.send(req)
			return sendEmail
		} catch (error) {
			return error
		}
	}
}
