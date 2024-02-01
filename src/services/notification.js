const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const notificationTemplateQueries = require('@database/queries/notificationTemplate')
const utils = require('@generics/utils')
const organizationQueries = require('@database/queries/organization')
const responses = require('@helpers/responses')

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
			const template = await notificationTemplateQueries.findOne({
				code: bodyData.code,
				organization_id: tokenInformation.organization_id,
			})
			if (template) {
				return responses.failureResponse({
					message: 'NOTIFICATION_TEMPLATE_ALREADY_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			bodyData['organization_id'] = tokenInformation.organization_id
			bodyData['created_by'] = tokenInformation.id

			const createdNotification = await notificationTemplateQueries.create(bodyData)
			return responses.successResponse({
				statusCode: httpStatusCode.created,
				message: 'NOTIFICATION_TEMPLATE_CREATED_SUCCESSFULLY',
				result: createdNotification,
			})
		} catch (error) {
			console.log(error)
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
				organization_id: tokenInformation.organization_id,
			}

			if (id) {
				filter.id = id
			} else {
				filter.code = bodyData.code
			}

			bodyData['organization_id'] = tokenInformation.organization_id
			bodyData['updated_by'] = tokenInformation.id

			const result = await notificationTemplateQueries.updateTemplate(filter, bodyData)
			if (result == 0) {
				return responses.failureResponse({
					message: 'NOTIFICATION_TEMPLATE_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			return responses.successResponse({
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

	static async read(id = null, code = null, organizationId) {
		try {
			let filter = { organization_id: organizationId }

			if (id) {
				filter.id = id
			} else {
				filter.code = code
			}

			const notificationTemplates = await notificationTemplateQueries.findAllNotificationTemplates(filter)
			console.log('NOTIFICATION TEMPLATES: ', notificationTemplates)
			let defaultOrgNotificationTemplates
			if (notificationTemplates.length === 0) {
				let defaultOrg = await organizationQueries.findOne(
					{ code: process.env.DEFAULT_ORGANISATION_CODE },
					{ attributes: ['id'] }
				)
				let defaultOrgId = defaultOrg.id
				filter = id ? { id, organization_id: defaultOrgId } : { code, organization_id: defaultOrgId }
				defaultOrgNotificationTemplates = await notificationTemplateQueries.findAllNotificationTemplates(filter)
			}
			if (notificationTemplates.length === 0 && defaultOrgNotificationTemplates.length === 0) {
				return responses.failureResponse({
					message: 'NOTIFICATION_TEMPLATE_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'NOTIFICATION_TEMPLATE_FETCHED_SUCCESSFULLY',
				result: notificationTemplates.length != 0 ? notificationTemplates : defaultOrgNotificationTemplates,
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}
	static async readAllNotificationTemplates(organizationId) {
		try {
			const notificationTemplates = await notificationTemplateQueries.findAllNotificationTemplates({
				organization_id: organizationId,
			})
			console.log('NOTIFICATION TEMPLATESSSSSSSSS: ', notificationTemplates)
			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'NOTIFICATION_TEMPLATE_FETCHED_SUCCESSFULLY',
				result: notificationTemplates,
			})
		} catch (error) {
			return error
		}
	}
}
