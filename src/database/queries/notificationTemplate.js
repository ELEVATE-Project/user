'use strict'
const NotificationTemplate = require('@database/models/index').NotificationTemplate
const { Op } = require('sequelize')
const common = require('@constants/common')

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
		const filter = {
			code: code,
			type: 'email',
			status: common.activeStatus,
			org_id: orgId || 1, //Temporary Default Org Id
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

exports.getEmailHeader = async (filter) => {
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

exports.getEmailFooter = async (filter) => {
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
