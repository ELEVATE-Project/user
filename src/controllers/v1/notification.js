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
const responses = require('@helpers/responses')

module.exports = class NotificationTemplate {
	/**
	 * create notification template
	 * @method
	 * @name template
	 * @param {Object} req -request data.
	 * @param {string} req.body.type - notification type.
	 * @param {string} req.body.code - template code.
	 * @param {string} req.body.subject -subject of notification
	 * @param {string} req.body.body -body of notification
	 * @param {string} req.body.email_header -header of notification
	 * @param {string} req.body.email_footer -footer of notification
	 * @returns {JSON} - returns the notification data
	 */

	async template(req) {
		try {
			if (!utilsHelper.validateRoleAccess(req.decodedToken.roles, [common.ADMIN_ROLE, common.ORG_ADMIN_ROLE])) {
				throw responses.failureResponse({
					message: 'USER_IS_NOT_A_ADMIN',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			if (req.method === common.PATCH_METHOD) {
				const updatedTemplate = await notificationService.update(req.params.id, req.body, req.decodedToken)
				return updatedTemplate
			} else if (req.method === common.GET_METHOD) {
				if (!req.params.id && !req.query.code) {
					const templatesData = await notificationService.readAllNotificationTemplates(
						req.decodedToken.organization_id
					)
					return templatesData
				} else {
					const templatesData = await notificationService.read(
						req.params.id,
						req.query.code,
						req.decodedToken.organization_id
					)
					return templatesData
				}
			} else {
				const createdTemplate = await notificationService.create(req.body, req.decodedToken)
				return createdTemplate
			}
		} catch (error) {
			return error
		}
	}
}
