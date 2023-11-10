const moment = require('moment')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const emailTemplates = [
			{
				code: 'deactivationotp',
				subject: 'Your OTP to deactivate your account on MentorED',
				body: '<div><p>Dear {name},</p> Your OTP to deactivate your account is {otp}. Please enter the OTP to deactivate. For your security, please do not share this OTP with anyone.</div>',
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
			emailTemplate['org_id'] = 1

			notificationTemplateData.push(emailTemplate)
		})

		await queryInterface.bulkInsert('notification_templates', notificationTemplateData, {})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('notification_templates', null, {})
	},
}
