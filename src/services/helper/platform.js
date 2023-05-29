const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')

module.exports = class platformHelper {
	/**
	 * Get app related config details
	 * @method
	 * @name getConfig
	 * @returns {JSON} - returns success response.
	 */
	static async getConfig() {
		try {
			let config = {
				meetingPlatform: process.env.DEFAULT_MEETING_SERVICE,
				reportIssue: {
					to: process.env.SUPPORT_EMAIL_ID,
					subject: common.REPORT_EMAIL_SUBJECT,
				},
			}

			return common.successResponse({
				statusCode: httpStatusCode.created,
				message: 'APP_CONFIG_FETCHED_SUCCESSFULLY',
				result: config,
			})
		} catch (error) {
			console.error(error)
			throw error
		}
	}
}
