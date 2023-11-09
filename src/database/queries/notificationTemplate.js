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
		/**If data exists for both `orgId` and `defaultOrgId`, the query will return the first matching record
		 * based on the order in which the values are provided in the array `[orgId, defaultOrgId]`.
		 * If a record with a matching `org_id` equal to `orgId` is found, it will be returned.
		 * If no match is found for `orgId`, then it will look for a match with `defaultOrgId`.
		 */
		const filter = {
			code: code,
			type: 'email',
			status: common.activeStatus,
			org_id: orgId
				? {
						[Op.or]: [orgId, defaultOrgId],
				  }
				: defaultOrgId,
		}

		let templateData = await NotificationTemplate.findOne({
			where: filter,
			raw: true,
		})

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
			status: common.activeStatus,
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
			status: common.activeStatus,
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
