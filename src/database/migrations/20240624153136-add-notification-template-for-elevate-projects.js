const moment = require('moment')

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const defaultOrgId = queryInterface.sequelize.options.defaultOrgId

		if (!defaultOrgId) {
			throw new Error('Default org ID is undefined. Please make sure it is set in sequelize options.')
		}

		const emailTemplates = [
			{
				code: 'user_registration',
				subject: 'Registration Successful!',
				body: '<p>Dear {name},</p> Welcome to {appName}.  We are excited to have you here!',
			},
			{
				code: 'user_otp_email',
				subject: 'Reset Otp',
				body: '<p>Dear {name},</p> Your OTP to reset your password is <strong>{otp}</strong>. Please enter the OTP to reset your password. For your security, please do not share this OTP with anyone.',
			},
			{
				code: 'user_registration_otp',
				subject: 'Your OTP to sign-up on the platform',
				body: '<div><p>Dear {name},</p> Your OTP to complete the registration process is <strong>{otp}</strong>. Please enter the OTP to complete the registration. For your security, please do not share this OTP with anyone.</div>',
			},
			{
				code: 'user_issue_report_email',
				subject: 'Support request from user',
				body: '<div><p>Hi Team,</p>{role} {name} is facing an issue in <b>{description}</b>-{userEmailId} in the platform.</div>',
			},
			{
				code: 'user_email_footer',
				body: "</div><div style='margin-top:20px;text-align:center;'><div>Regards,</div><div>Team Elevate </div><div style='margin-top:20px;color:#b13e33;text-align:center'><div>Note: Do not reply to this email. This email is sent from an unattended mailbox. Replies will not be read.</div><div>For any queries, please feel free to reach out to us at support@shikshalokam.org</div></div></div></div>",
			},
			{
				code: 'user_email_header',
				body: "<div style='margin:auto;width:100%;max-width:650px;'><p style='text-align:center'><img class='imgPath' style='width:35%' alt='Elevate' src=''></p><div style='text-align:center'>",
			},
		]

		let notificationTemplateData = []
		emailTemplates.forEach(async function (emailTemplate) {
			emailTemplate['status'] = 'ACTIVE'
			emailTemplate['type'] = 'email'
			emailTemplate['updated_at'] = moment().format()
			emailTemplate['created_at'] = moment().format()
			emailTemplate['organization_id'] = defaultOrgId
			if (emailTemplate.code == 'user_email_footer') {
				emailTemplate['type'] = 'emailFooter'
			} else if (emailTemplate.code == 'user_email_header') {
				emailTemplate['type'] = 'emailHeader'
			} else {
				emailTemplate['email_footer'] = 'user_email_footer'
				emailTemplate['email_header'] = 'user_email_header'
			}
			notificationTemplateData.push(emailTemplate)
		})

		await queryInterface.bulkInsert('notification_templates', notificationTemplateData, {})
	},

	down: async (queryInterface, Sequelize) => {
		const emailTemplateCodes = [
			'user_registration',
			'user_otp_email',
			'user_registration_otp',
			'user_issue_report_email',
			'user_email_footer',
			'user_email_header',
		]

		await queryInterface.bulkDelete(
			'notification_templates',
			{
				code: emailTemplateCodes,
			},
			{}
		)
	},
}
