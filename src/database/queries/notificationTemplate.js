const NotificationTemplate = require('@database/models/index').NotificationTemplate
const { getDefaultOrgId } = require('@helpers/getDefaultOrgId')
const { Op } = require('sequelize')

module.exports = class NotificationTemplateData {
	static async findOneEmailTemplate(code, orgId) {
		try {
			const defaultOrgId = await getDefaultOrgId()
			if (!defaultOrgId) {
				return common.failureResponse({
					message: 'DEFAULT_ORG_ID_NOT_SET',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			/**If data exists for both `orgId` and `defaultOrgId`, the query will return the first matching records
			 * we will filter required data based on condition from it
			 * if orgId passed -> get template defined by particular org or get default org template
			 */
			const filter = {
				code: code,
				type: 'email',
				status: 'active',
				organization_id: orgId ? { [Op.or]: [orgId, defaultOrgId] } : defaultOrgId,
			}

			let templateData = await NotificationTemplate.findAll({
				where: filter,
				raw: true,
			})

			// If there are multiple results, find the one matching orgId
			templateData = templateData.find((template) => template.organization_id === orgId) || templateData[0]

			// If no data is found, set an empty object
			templateData = templateData || {}

			if (templateData && templateData.email_header) {
				const header = await this.getEmailHeader(templateData.email_header)
				if (header && header.body) {
					templateData.body = header.body + templateData.body
				}
			}

			if (templateData && templateData.email_footer) {
				const footer = await this.getEmailFooter(templateData.email_footer)
				if (footer && footer.body) {
					templateData.body += footer.body
				}
			}
			return templateData
		} catch (error) {
			return error
		}
	}

	static async getEmailHeader(header) {
		try {
			const headerData = await NotificationTemplate.findOne({
				where: {
					code: header,
					type: 'emailHeader',
					status: 'active',
				},
				raw: true,
			})

			return headerData
		} catch (error) {
			return error
		}
	}

	static async getEmailFooter(footer) {
		try {
			const footerData = await NotificationTemplate.findOne({
				where: {
					code: footer,
					type: 'emailFooter',
					status: 'active',
				},
				raw: true,
			})

			return footerData
		} catch (error) {
			return error
		}
	}

	static async findOne(filter, options = {}) {
		try {
			return await NotificationTemplate.findOne({
				where: filter,
				...options,
				raw: true,
			})
		} catch (error) {
			return error
		}
	}

	static async updateTemplate(filter, update, options = {}) {
		try {
			const template = await NotificationTemplate.update(update, {
				where: filter,
				...options,
				individualHooks: true,
			})

			return template
		} catch (error) {
			return error
		}
	}

	static async findAllNotificationTemplates(filter, options = {}) {
		try {
			const templates = await NotificationTemplate.findAll({
				where: filter,
				...options,
				raw: true,
			})

			// templates.forEach(async(template) => {
			// 	if (template.email_header) {
			// 		const header = await this.getEmailHeader(template.email_header)
			// 		if (header && header.body) {
			// 			template['body'] = header.body + template['body']
			// 		}
			// 	}

			// 	if (template.email_footer) {
			// 		const footer = await this.getEmailFooter(template.email_footer)
			// 		if (footer && footer.body) {
			// 			template['body'] = template['body'] + footer.body
			// 		}
			// 	}
			// })

			return templates
		} catch (error) {
			return error
		}
	}

	static async create(data) {
		try {
			return await NotificationTemplate.create(data)
		} catch (error) {
			return error
		}
	}
}
