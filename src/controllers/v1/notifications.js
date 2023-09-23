/**
 * name : notifications.js
 * author : Rakesh Kumar
 * created-date : 09-Dec-2021
 * Description : notifications related functions.
 */

// Dependencies
const notificationsHelper = require('@services/notifications')
const httpStatusCode = require('@generics/http-status')

module.exports = class Notifications {
	/**
	 * Notification email cron job before 15min.
	 * @method
	 * @name emailCronJobBeforeFifteenMin
	 * @returns {JSON} - Send email notification.
	 */

	async emailCronJobBeforeFifteenMin() {
		try {
			notificationsHelper.sendNotificationBefore15mins()
			return {
				statusCode: httpStatusCode.ok,
			}
		} catch (error) {
			return error
		}
	}

	/**
	 * Notification email cron job before 24hrs.
	 * @method
	 * @name emailCronJobBeforeOneDay
	 * @returns {JSON} - Send email notification.
	 */

	async emailCronJobBeforeOneDay() {
		try {
			notificationsHelper.sendNotificationBefore24Hour()
			return {
				statusCode: httpStatusCode.ok,
			}
		} catch (error) {
			return error
		}
	}

	/**
	 * Notification email cron job before 1hr.
	 * @method
	 * @name emailCronJobBeforeOneHour
	 * @returns {JSON} - Send email notification.
	 */

	async emailCronJobBeforeOneHour() {
		try {
			notificationsHelper.sendNotificationBefore1Hour()
			return {
				statusCode: httpStatusCode.ok,
			}
		} catch (error) {
			return error
		}
	}
}
