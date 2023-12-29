'use strict'
const NotificationTemplate = require('@database/models/index').NotificationTemplate
const { Op } = require('sequelize')
const common = require('@constants/common')
const organizationQueries = require('@database/queries/organization')

exports.create = async (data) => {
	try {
		return await NotificationTemplate.create(data)
	} catch (error) {
		return error
	}
}

exports.findOne = async (filter, options = {}) => {
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

exports.findOneEmailTemplate = async (code, orgId) => {
	try {
		// Get default orgId using code defined in env
		const defaultOrg = await organizationQueries.findOne(
			{ code: process.env.DEFAULT_ORGANISATION_CODE },
			{ attributes: ['id'] }
		)
		const defaultOrgId = defaultOrg.id
		/**If data exists for both `orgId` and `defaultOrgId`, the query will return data for both
		 * Later we will filter the response
		 */
		const filter = {
			code: code,
			type: 'email',
			status: common.ACTIVE_STATUS,
			organization_id: orgId
				? {
						[Op.or]: [orgId, defaultOrgId],
				  }
				: defaultOrgId,
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
				templateData['body'] = header.body + templateData['body']
			}
		}

		if (templateData && templateData.email_footer) {
			const footer = await this.getEmailFooter(templateData.email_footer)
			if (footer && footer.body) {
				templateData['body'] = templateData['body'] + footer.body
			}
		}
		return templateData
	} catch (error) {
		return error
	}
}

exports.getEmailHeader = async (header) => {
	try {
		const filterEmailHeader = {
			code: header,
			type: 'emailHeader',
			status: common.ACTIVE_STATUS,
		}

		const headerData = await NotificationTemplate.findOne({
			where: filterEmailHeader,
			raw: true,
		})
		return headerData
	} catch (error) {
		return error
	}
}

exports.getEmailFooter = async (footer) => {
	try {
		const filterEmailFooter = {
			code: footer,
			type: 'emailFooter',
			status: common.ACTIVE_STATUS,
		}

		const headerData = await NotificationTemplate.findOne({
			where: filterEmailFooter,
			raw: true,
		})
		return headerData
	} catch (error) {
		return error
	}
}

exports.updateTemplate = async (filter, update, options = {}) => {
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

exports.findAllNotificationTemplates = async (filter, options = {}) => {
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
