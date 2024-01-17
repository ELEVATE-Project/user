/**
 * name : notifications.js
 * author : Rakesh Kumar
 * created-date : 09-Dec-2021
 * Description : notifications related functions.
 */

// Dependencies
const notificationsService = require('@services/notifications')
const httpStatusCode = require('@generics/http-status')

module.exports = class Notifications {
	/**
	 * @description			- Notification email cron job.
	 * @method				- post
	 * @name 				- emailCronJob
	 * @returns {JSON} 		- Send email notification.
	 */

	async emailCronJob(req) {
		try {
			// Make a call to notification service
			notificationsService.sendNotification(
				req.body.job_id,
				req.body.email_template_code,
				req.body.job_creator_org_id ? parseInt(req.body.job_creator_org_id, 10) : ''
			)
			return {
				statusCode: httpStatusCode.ok,
			}
		} catch (error) {
			return error
		}
	}
}
