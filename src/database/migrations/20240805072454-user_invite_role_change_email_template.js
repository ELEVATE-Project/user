'use strict'

require('module-alias/register')
const moment = require('moment')

module.exports = {
	up: async (queryInterface, Sequelize) => {
		try {
			const defaultOrgId = queryInterface.sequelize.options.defaultOrgId
			// Your email template data
			const emailTemplates = [
				{
					body: '<p>Dear {name},</p> <p>We wanted to inform you that your role on our platform has been updated.</p> <p>Your new role : {role}</p> <p>What this means for you:</p> <p>{description}</p>',
					code: 'user_invites_role_change',
					subject: 'Important: Role Updated on MentorEd',
				},
			]
			// Check if email templates exist
			const existingTemplates = await queryInterface.sequelize.query(
				'SELECT code FROM notification_templates WHERE organization_id = :orgId',
				{
					replacements: { orgId: defaultOrgId },
					type: Sequelize.QueryTypes.SELECT,
				}
			)

			const newTemplates = emailTemplates.filter((template) => {
				return !existingTemplates.some((existingTemplate) => existingTemplate.code === template.code)
			})

			// Insert new email templates
			const notificationTemplateData = newTemplates.map((emailTemplate) => {
				emailTemplate['status'] = 'ACTIVE'
				emailTemplate['type'] = 'email'
				emailTemplate['updated_at'] = moment().format()
				emailTemplate['created_at'] = moment().format()
				emailTemplate['organization_id'] = defaultOrgId
				if (emailTemplate.code == 'email_footer') {
					emailTemplate['type'] = 'emailFooter'
				} else if (emailTemplate.code == 'email_header') {
					emailTemplate['type'] = 'emailHeader'
				} else {
					emailTemplate['email_footer'] = 'email_footer'
					emailTemplate['email_header'] = 'email_header'
				}
				return emailTemplate
			})
			if (notificationTemplateData.length != 0) {
				await queryInterface.bulkInsert('notification_templates', notificationTemplateData, {})
			}

			const body = `<p>Dear {name},</p> Please find attached the status of your bulk upload activity.`
			const updateData = { body }

			const updateFilter = { code: 'invitee_upload_status', organization_id: defaultOrgId }
			await queryInterface.bulkUpdate('notification_templates', updateData, updateFilter)
		} catch (error) {
			console.log('Error:', error)
		}
	},

	down: async (queryInterface, Sequelize) => {
		const defaultOrgId = queryInterface.sequelize.options.defaultOrgId

		await queryInterface.bulkDelete('notification_templates', { organization_id: defaultOrgId }, {})
	},
}
