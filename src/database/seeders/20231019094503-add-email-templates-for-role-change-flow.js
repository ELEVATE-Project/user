const moment = require('moment')

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const defaultOrgId = queryInterface.sequelize.options.defaultOrgId
		if (!defaultOrgId) {
			throw new Error('Default org ID is undefined. Please make sure it is set in sequelize options.')
		}
		const emailTemplates = [
			{
				code: 'mentor_request_accepted',
				subject: 'MentorED - Congratulations! Your Mentor Request has been approved',
				body: '<p>Dear {name},</p> We hope this message finds you in great spirits. We are pleased to inform you that your request to become a mentor for organisation {orgName} has been accepted. Your dedication and expertise make you a valuable addition to our mentorship community. Login to {appName} to start your journey as a mentor now. <br><br> Click here to login: {portalURL}',
			},
			{
				code: 'mentor_request_rejected',
				subject: 'Mentor Request Update',
				body: '<p>Dear {name},</p> We hope this message finds you well. We appreciate your interest in becoming a mentor for {orgName} and the time you have invested in filling the form. After careful consideration, we regret to inform you that your request to become a mentor has not been successful at this time. Please know that this decision is not a reflection of your capabilities or qualifications. We encourage you to continue your engagement as a mentee on our platform.',
			},
		]

		let notificationTemplateData = []
		emailTemplates.forEach(async function (emailTemplate) {
			emailTemplate['status'] = 'ACTIVE'
			emailTemplate['type'] = 'email'
			emailTemplate['updated_at'] = moment().format()
			emailTemplate['created_at'] = moment().format()
			emailTemplate['organization_id'] = defaultOrgId
			emailTemplate['email_footer'] = 'email_footer'
			emailTemplate['email_header'] = 'email_header'

			notificationTemplateData.push(emailTemplate)
		})

		await queryInterface.bulkInsert('notification_templates', notificationTemplateData, {})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('notification_templates', null, {})
	},
}
