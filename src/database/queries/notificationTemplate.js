'use strict'
const NotificationTemplate = require('@database/models/index').NotificationTemplate
const { Op } = require('sequelize')
const common = require('@constants/common')

exports.create = async (data) => {
	try {
		return await NotificationTemplate.create(data)
	} catch (error) {
		throw error
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
		throw error
	}
}

exports.findOneSMSTemplate = async (code, orgCode, tenantCode) => {
	try {
		const defaultOrgCode = process.env.DEFAULT_ORGANISATION_CODE

		const filter = {
			code,
			type: common.notificationSMSType,
			status: common.ACTIVE_STATUS,
			tenant_code: tenantCode,
			organization_code:
				orgCode && orgCode != defaultOrgCode
					? {
							[Op.or]: [orgCode, defaultOrgCode],
					  }
					: defaultOrgCode,
		}

		let templateData = await NotificationTemplate.findAll({
			where: filter,
			raw: true,
		})

		const matchedTemplate =
			templateData.find((template) => template.organization_code === orgCode) || templateData[0]

		return matchedTemplate || null // return null if nothing is found
	} catch (error) {
		console.error('Error in findOneSMSTemplate:', error)
		return null
	}
}

exports.findOneEmailTemplate = async (code, orgCode = null, tenantCode) => {
	try {
		const defaultOrgCode = process.env.DEFAULT_ORGANISATION_CODE
		/**If data exists for both `orgId` and `defaultOrgId`, the query will return data for both
		 * Later we will filter the response
		 */
		const filter = {
			code: code,
			type: 'email',
			tenant_code: tenantCode,
			status: common.ACTIVE_STATUS,
			organization_code:
				orgCode && orgCode != defaultOrgCode
					? {
							[Op.or]: [orgCode, defaultOrgCode],
					  }
					: defaultOrgCode,
		}

		let templateData = await NotificationTemplate.findAll({
			where: filter,
			raw: true,
		})
		if (!templateData || templateData?.length == 0) return null
		// If there are multiple results, find the one matching orgId
		templateData = templateData.find((template) => template.organization_code === orgCode) || templateData[0]

		if (templateData && templateData.email_header) {
			const header = await this.getEmailHeader(
				templateData.email_header,
				templateData.tenant_code,
				templateData.organization_code
			)
			if (header && header.body) {
				templateData['body'] = header.body + templateData['body']
			}
		}

		if (templateData && templateData.email_footer) {
			const footer = await this.getEmailFooter(
				templateData.email_footer,
				templateData.tenant_code,
				templateData.organization_code
			)
			if (footer && footer.body) {
				templateData['body'] = templateData['body'] + footer.body
			}
		}
		return templateData
	} catch (error) {
		throw error
	}
}

exports.getEmailHeader = async (header, tenantCode, organizationCode) => {
	try {
		const filterEmailHeader = {
			code: header,
			type: 'emailHeader',
			status: common.ACTIVE_STATUS,
			tenant_code: tenantCode,
			organization_code: organizationCode,
		}

		const headerData = await NotificationTemplate.findOne({
			where: filterEmailHeader,
			raw: true,
		})
		return headerData
	} catch (error) {
		throw error
	}
}

exports.getEmailFooter = async (footer, tenantCode, organizationCode) => {
	try {
		const filterEmailFooter = {
			code: footer,
			type: 'emailFooter',
			status: common.ACTIVE_STATUS,
			tenant_code: tenantCode,
			organization_code: organizationCode,
		}

		const headerData = await NotificationTemplate.findOne({
			where: filterEmailFooter,
			raw: true,
		})
		return headerData
	} catch (error) {
		throw error
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
		throw error
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
		throw error
	}
}

exports.hardDelete = async (id) => {
	try {
		return await NotificationTemplate.destroy({
			where: {
				id: id,
			},
			force: true,
		})
	} catch (error) {
		throw error
	}
}
