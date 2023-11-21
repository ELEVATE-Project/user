const moment = require('moment')

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const defaultOrgId = queryInterface.sequelize.options.defaultOrgId

		if (!defaultOrgId) {
			throw new Error('Default org ID is undefined. Please make sure it is set in sequelize options.')
		}

		const emailTemplates = [
			{
				code: 'registration',
				subject: 'MentorED - Registration Successful!',
				body: '<p>Dear {name},</p> Welcome to {appName}. You have taken your first step towards connecting, learning, and solving with members of your community and we are excited to have you here!',
			},
			{
				code: 'emailotp',
				subject: 'MentorED - Reset Otp',
				body: '<p>Dear {name},</p> Your OTP to reset your password is {otp}. Please enter the OTP to reset your password. For your security, please do not share this OTP with anyone.',
			},
			{
				code: 'registrationotp',
				subject: 'Your OTP to sign-up on MentorED',
				body: '<div><p>Dear {name},</p> Your OTP to complete the registration process is {otp}. Please enter the OTP to complete the registration. For your security, please do not share this OTP with anyone.</div>',
			},
			{
				code: 'user_issue_reported',
				subject: 'Support request for MentorED',
				body: '<div><p>Hi Team,</p>{role} {name} is facing an issue in <b>{description}</b>-{userEmailId} in version 2.1 of MentorED.</div>',
			},
			{
				code: 'email_footer',
				body: "</div><div style='margin-top:20px;text-align:center;'><div>Regards,</div><div>Team MentorED</div><div style='margin-top:20px;color:#b13e33;text-align:center'><div>Note: Do not reply to this email. This email is sent from an unattended mailbox. Replies will not be read.</div><div>For any queries, please feel free to reach out to us at support@shikshalokam.org</div></div></div></div>",
			},
			{
				code: 'email_header',
				body: "<div style='margin:auto;width:100%;max-width:650px;'><p style='text-align:center'><img class='imgPath' style='width:35%' alt='MentorED' src='https://mentoring-dev-storage.s3.ap-south-1.amazonaws.com/email/image/emailLogo.png'></p><div style='text-align:center'>",
			},
		]

		let notificationTemplateData = []
		emailTemplates.forEach(async function (emailTemplate) {
			emailTemplate['org_id'] = 1
			emailTemplate['status'] = 'ACTIVE'
			emailTemplate['type'] = 'email'
			emailTemplate['updated_at'] = moment().format()
			emailTemplate['created_at'] = moment().format()
			emailTemplate['org_id'] = defaultOrgId
			if (emailTemplate.code == 'email_footer') {
				emailTemplate['type'] = 'emailFooter'
			} else if (emailTemplate.code == 'email_header') {
				emailTemplate['type'] = 'emailHeader'
			} else {
				emailTemplate['email_footer'] = 'email_footer'
				emailTemplate['email_header'] = 'email_header'
			}
			notificationTemplateData.push(emailTemplate)
		})

		await queryInterface.bulkInsert('notification_templates', notificationTemplateData, {})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('notification_templates', null, {})
	},
}
