const issueData = require('@db/issues/query')
const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')
const ObjectId = require('mongoose').Types.ObjectId

const utils = require('@generics/utils')
const kafkaCommunication = require('@generics/kafka-communication')
const notificationTemplateData = require('@db/notification-template/query')

module.exports = class issuesHelper {
	/**
	 * Report an issue.
	 * @method
	 * @name create
	 * @param {Object} bodyData - Reported issue body data.
	 * @param {String} decodedToken - Token information.
	 * @returns {JSON} - Success response.
	 */

	static async create(bodyData, decodedToken) {
		try {
			const name = decodedToken.name
			const role = decodedToken.isAMentor ? 'Mentor' : 'Mentee'
			const email = process.env.SUPPORT_EMAIL_ID

			bodyData.userId = ObjectId(decodedToken._id) //Getting user id from tokenDetail.

			if (process.env.ENABLE_EMAIL_FOR_REPORT_ISSUE === 'true') {
				const templateData = await notificationTemplateData.findOneEmailTemplate(
					process.env.REPORT_ISSUE_EMAIL_TEMPLATE_CODE
				)
				if (templateData) {
					const payload = {
						type: 'email',
						email: {
							to: email,
							subject: templateData.subject,
							body: utils.composeEmailBody(templateData.body, {
								name,
								role,
								description: bodyData.description,
							}),
						},
					}
					await kafkaCommunication.pushEmailToKafka(payload)
					bodyData.isEmailTriggered = true
				}
			}
			await issueData.create(bodyData)

			return common.successResponse({
				statusCode: httpStatusCode.created,
				message: 'ISSUE_REPORTED_SUCCESSFULLY',
			})
		} catch (error) {
			throw error
		}
	}
}
