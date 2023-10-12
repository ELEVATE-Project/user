const moment = require('moment')

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const emailTemplates = [
			{
				code: 'invitee_upload_status',
				subject: 'Status of Invitees Upload to MentorEd',
				body: '<p>Dear {name},</p> You have successfully uploaded the list of invitees to the MentorEd platform. For your review, we have included a link to the file detailing the upload status of each invitee: <br><a href={inviteeUploadURL}>Download File</a><br><br>This will provide a comprehensive overview of the invitees and their respective statuses. Thank you for your continued support, and we look forward to our continued collaboration on the MentorEd platform.',
				status: 'ACTIVE',
				type: 'email',
				email_footer: 'email_footer',
				email_header: 'email_header',
				updated_at: moment().format(),
				created_at: moment().format(),
			},
		]

		await queryInterface.bulkInsert('notification_templates', emailTemplates, {})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('notification_templates', null, {})
	},
}
