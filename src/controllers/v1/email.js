const emailHelper = require('@services/email')

module.exports = class Email {
	/**
	 * send email
	 * @method
	 * @name send
	 * @param {Object} req -request data.
	 * @param {Object} req.body -request body contains user creation deatils.
	 * @param {String} req.body.type - type of payload email
	 * @param {Object} req.body.email - email object
	 * @param {String} req.body.email.to - email id of receiver
	 * @param {String} req.body.email.cc - email id of receiver in cc
	 * @param {String} req.body.email.subject - subject of email
	 * @param {String} req.body.email.body - body of email
	 * @returns {JSON} - Email Status
	 */

	async send(req) {
		const params = req.body
		try {
			const sendEmail = await emailHelper.send(params)
			return sendEmail
		} catch (error) {
			return error
		}
	}
}
