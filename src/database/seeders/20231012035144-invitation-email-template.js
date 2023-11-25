const moment = require('moment')

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const defaultOrgId = queryInterface.sequelize.options.defaultOrgId
		if (!defaultOrgId) {
			throw new Error('Default org ID is undefined. Please make sure it is set in sequelize options.')
		}
		const emailTemplates = [
			{
				code: 'invite_mentor',
				subject: 'Welcome Aboard as a Mentor!',
				body: '<p>Dear {name},</p> We are delighted to inform you that you have been successfully onboarded as a mentor for {orgName}. Your expertise and willingness to share your knowledge will undoubtedly be a tremendous asset to our mentoring program.<br>We request you to register on our Mentoring Platform (if not already), to start your journey with us as a Mentor.',
			},
			{
				code: 'invite_mentee',
				subject: 'Welcome Aboard as a Mentee!',
				body: '<p>Dear {name},</p> We are delighted to inform you that you have been successfully onboarded as a mentee for {orgName}. You can now explore learning opportunities with our mentors. <br>We request you to register on our Mentoring Platform (if not already), to start your journey with us as a Mentee.',
			},
			{
				code: 'invitee_upload_status',
				subject: 'Bulk upload Status',
				body: '<p>Dear {name},</p> PFA, status of your bulk upload activity by clicking on the <a href={inviteeUploadURL}>link</a>',
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
