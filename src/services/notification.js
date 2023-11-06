const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const notificationTemplateQueries = require('@database/queries/notificationTemplate')
const utils = require('@generics/utils')

module.exports = class NotificationTemplateHelper {
	/**
	 * Create Notification template.
	 * @method
	 * @name create
	 * @param {Object} bodyData
	 * @returns {JSON} - Notification template creation data.
	 */

	static async create(bodyData, tokenInformation) {
		try {
			const template = await notificationTemplateQueries.findOne({ code: bodyData.code })
			if (template) {
				return common.failureResponse({
					message: 'NOTIFICATION_TEMPLATE_ALREADY_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			bodyData['org_id'] = tokenInformation.organization_id
			bodyData['created_by'] = tokenInformation.id

			const createdNotification = await notificationTemplateQueries.create(bodyData)
			return common.successResponse({
				statusCode: httpStatusCode.created,
				message: 'NOTIFICATION_TEMPLATE_CREATED_SUCCESSFULLY',
				result: createdNotification,
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * Update Notification template.
	 * @method
	 * @name update
	 * @param {Object} bodyData
	 * @returns {JSON} - Update Notification template.
	 */

	static async update(id, bodyData, tokenInformation) {
		try {
			let filter = {
				org_id: tokenInformation.organization_id,
			}

			if (id) {
				filter.id = id
			} else {
				filter.code = bodyData.code
			}

			bodyData['org_id'] = tokenInformation.organization_id
			bodyData['updated_by'] = tokenInformation.id

			const result = await notificationTemplateQueries.updateTemplate(filter, bodyData)
			if (result == 0) {
				return common.failureResponse({
					message: 'NOTIFICATION_TEMPLATE_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			return common.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'NOTIFICATION_TEMPLATE_UPDATED_SUCCESSFULLY',
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * Read Notification template.
	 * @method
	 * @name read
	 * @param {Object} bodyData
	 * @returns {JSON} - Read Notification template.
	 */

	static async read(id = null, code = null, org_id) {
		try {
			let filter = { org_id }

			if (id) {
				filter.id = id
			} else {
				filter.code = code
			}

			const notificationTemplates = await notificationTemplateQueries.findAllNotificationTemplates(filter)
			if (!notificationTemplates) {
				return common.failureResponse({
					message: 'NOTIFICATION_TEMPLATE_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'NOTIFICATION_TEMPLATE_FETCHED_SUCCESSFULLY',
				result: notificationTemplates ? notificationTemplates : {},
			})
		} catch (error) {
			throw error
		}
	}
	static async readAllNotificationTemplates(org_id) {
		try {
			const notificationTemplates = await notificationTemplateQueries.findAllNotificationTemplates({
				org_id,
			})

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'NOTIFICATION_TEMPLATE_FETCHED_SUCCESSFULLY',
				result: notificationTemplates,
			})
		} catch (error) {
			return error
		}
	}
}
