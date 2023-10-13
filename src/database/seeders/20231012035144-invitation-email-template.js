const moment = require('moment')

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const emailTemplates = [
			{
				code: 'invite_user',
				subject: 'Join Us at MentorED',
				body: '<p>Dear {name},</p> {adminName} invited you to become a {role} on {appName}. We are delighted to have you join us on our dynamic platform that dedicated to fostering meaningful connections and professional growth',
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
