/**
 * name : notification.js
 * author : Priyanka Pradeep
 * created-date : 03-Nov-2023
 * Description : Notification Controller.
 */

// Dependencies
const notificationService = require('@services/notification')
const utilsHelper = require('@generics/utils')
const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')

module.exports = class NotificationTemplate {
	/**
	 * create notification template
	 * @method
	 * @name create
	 * @param {Object} req -request data.
	 * @param {string} req.body.type - notification type.
	 * @param {string} req.body.code - template code.
	 * @param {string} req.body.subject -subject of notification
	 * @param {string} req.body.body -body of notification
	 * @param {string} req.body.email_header -header of notification
	 * @param {string} req.body.email_footer -footer of notification
	 * @returns {JSON} - returns the notification data
	 */

	async create(req) {
		try {
			if (!utilsHelper.validateRoleAccess(req.decodedToken.roles, [common.ADMIN_ROLE, common.ORG_ADMIN_ROLE])) {
				throw common.failureResponse({
					message: 'USER_IS_NOT_A_ADMIN',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const createdTemplate = await notificationService.create(req.body, req.decodedToken)
			return createdTemplate
		} catch (error) {
			return error
		}
	}

	/**
	 * update notification template
	 * @method
	 * @name update
	 * @param {Object} req -request data.
	 * @param {string} req.body.type - notification type.
	 * @param {string} req.body.code - template code.
	 * @param {string} req.body.subject -subject of notification
	 * @param {string} req.body.body -body of notification
	 * @param {string} req.body.email_header -header of notification
	 * @param {string} req.body.email_footer -footer of notification
	 * @returns {JSON} - returns the notification data
	 */

	async update(req) {
		try {
			if (!utilsHelper.validateRoleAccess(req.decodedToken.roles, [common.ADMIN_ROLE, common.ORG_ADMIN_ROLE])) {
				throw common.failureResponse({
					message: 'USER_IS_NOT_A_ADMIN',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const updatedTemplate = await notificationService.update(req.params.id, req.body, req.decodedToken)
			return updatedTemplate
		} catch (error) {
			return error
		}
	}

	/**
	 * read notification template
	 * @method
	 * @name read
	 * @param {Object} req -request data.
	 * @param {string} req.params.id - notification template id.
	 * @param {string} req.query.code -notification template code.
	 * @returns {JSON} - returns the notification template data
	 */

	async read(req) {
		try {
			if (!req.params.id || !req.query.code) {
				const template = await notificationService.readAllNotificationTemplates(
					req.decodedToken.organization_id
				)
				return template
			} else {
				const template = await notificationService.read(
					req.params.id,
					req.query.code,
					req.decodedToken.organization_id
				)
				return template
			}
		} catch (error) {
			return error
		}
	}
}
