const NotificationTemplate = require('@database/models/index').NotificationTemplate

module.exports = class NotificationTemplateData {
	static async findOneEmailTemplate(code) {
		try {
			const templateData = await NotificationTemplate.findOne({
				where: {
					code,
					type: 'email',
					status: 'active',
				},
			})

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
			})

			return footerData
		} catch (error) {
			return error
		}
	}
}
