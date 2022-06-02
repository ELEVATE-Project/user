const emailNotifications = require('../../generics/helpers/email-notifications')
const common = require('../../constants/common')
const httpStatusCode = require('../../generics/http-status')
const apiResponses = require('../../constants/api-responses')

module.exports = class EmailHelper {
	static async send(req) {
		let notificationData = req.body
		console.log(notificationData)
		if (notificationData.type == 'email' && notificationData.email) {
			let result = await emailNotifications.sendEmail(notificationData.email)
			if (result && result.status == 'success') {
				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: apiResponses.EMAIL_SENT_SUCCESSFULLY,
					result,
				})
			} else {
				return common.failureResponse({
					message: apiResponses.MAIL_SENT_FAILED,
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
		}
	}
}
