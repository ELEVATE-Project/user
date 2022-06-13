/**
 * name : models/notification-template/query
 * author : Aman Gupta
 * Date : 06-Dec-2021
 * Description : Notification template database operations
 */

const NotificationTemplate = require('./model')

module.exports = class NotificationTemplateData {
	static async findOneEmailTemplate(code) {
		const filter = {
			code,
			type: 'email',
			deleted: false,
			status: 'active',
		}

		try {
			const templateData = await NotificationTemplate.findOne(filter).lean()

			if (templateData && templateData.emailHeader) {
				const header = await this.getEmailHeader(templateData.emailHeader)
				if (header && header.body) {
					templateData['body'] = header.body + templateData['body']
				}
			}

			if (templateData && templateData.emailFooter) {
				const footer = await this.getEmailFooter(templateData.emailFooter)
				if (footer && footer.body) {
					templateData['body'] = templateData['body'] + footer.body
				}
			}

			return templateData
		} catch (error) {
			return error
		}
	}

	static async getEmailHeader(header) {
		try {
			const filterEmailHeader = {
				code: header,
				type: 'emailHeader',
				deleted: false,
				status: 'active',
			}
			const headerData = await NotificationTemplate.findOne(filterEmailHeader).lean()

			return headerData
		} catch (error) {
			return error
		}
	}
	static async getEmailFooter(footer) {
		try {
			const filterEmailFooter = {
				code: footer,
				type: 'emailFooter',
				deleted: false,
				status: 'active',
			}
			const footerData = await NotificationTemplate.findOne(filterEmailFooter).lean()

			return footerData
		} catch (error) {
			return error
		}
	}
}
