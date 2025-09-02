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
			bodyData['organization_code'] = tokenInformation.organization_code
			bodyData['tenant_code'] = tokenInformation.tenant_code
			bodyData['created_by'] = tokenInformation.id

			const createdNotification = await notificationTemplateQueries.create(bodyData)
			return responses.successResponse({
				statusCode: httpStatusCode.created,
				message: 'NOTIFICATION_TEMPLATE_CREATED_SUCCESSFULLY',
				result: createdNotification,
			})
		} catch (error) {
			// Handle unique constraint error
			if (
				error.name === common.SEQUELIZE_UNIQUE_CONSTRAINT_ERROR ||
				error.code === common.SEQUELIZE_UNIQUE_CONSTRAINT_ERROR_CODE
			) {
				return responses.failureResponse({
					statusCode: httpStatusCode.conflict,
					responseCode: 'CLIENT_ERROR',
					message: 'NOTIFICATION_TEMPLATE_ALREADY_EXISTS',
				})
			}
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
				organization_code: tokenInformation.organization_code,
				tenant_code: tokenInformation.tenant_code,
			}

			if (id) {
				filter.id = id
			} else {
				filter.code = bodyData.code
			}

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

	static async read(id = null, code = null, type, organizationCode, tenantCode) {
		try {
			let filter = {
				organization_code: organizationCode,
				tenant_code: tenantCode,
				...((!id && type) || type ? { type } : {}),
				...(id ? { id } : { code }),
			}

			const notificationTemplates = await notificationTemplateQueries.findAllNotificationTemplates(filter)

			let defaultOrgNotificationTemplates
			if (notificationTemplates.length === 0) {
				let defaultOrgCode = process.env.DEFAULT_ORGANISATION_CODE
				filter = {
					...(id ? { id } : { code }),
					organization_code: defaultOrgCode,
					tenant_code: tenantCode,
					type,
				}

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
	static async readAllNotificationTemplates(organizationCode, tenantCode) {
		try {
			const notificationTemplates = await notificationTemplateQueries.findAllNotificationTemplates({
				organization_code: organizationCode,
				tenant_code: tenantCode,
			})
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
