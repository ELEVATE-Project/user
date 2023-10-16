const moment = require('moment')

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const emailTemplates = [
			{
				code: 'invite_user',
				subject: 'Join Us at MentorED',
				body: '<p>Dear {name},</p> {adminName} invited you to become a {role} on {appName}. We are delighted to have you join us on our dynamic platform that dedicated to fostering meaningful connections and professional growth',
			},
			{
				code: 'invitee_upload_status',
				subject: 'Status of Invitees Upload to MentorEd',
				body: '<p>Dear {name},</p> You have successfully uploaded the list of invitees to the MentorEd platform. For your review, we have included a link to the file detailing the upload status of each invitee: <br><a href={inviteeUploadURL}>Download File</a><br><br>This will provide a comprehensive overview of the invitees and their respective statuses. Thank you for your continued support, and we look forward to our continued collaboration on the MentorEd platform.',
			},
		]

		let notificationTemplateData = []
		emailTemplates.forEach(async function (emailTemplate) {
			emailTemplate['status'] = 'ACTIVE'
			emailTemplate['type'] = 'email'
			emailTemplate['updated_at'] = moment().format()
			emailTemplate['created_at'] = moment().format()

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
