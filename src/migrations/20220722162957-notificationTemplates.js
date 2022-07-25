module.exports = {
	async up(db) {
		global.migrationMsg = 'Include collectionName and what does it update'
		const notificationTemplates = [
			{
				type: 'email',
				code: 'registration',
				subject: 'MentorED - Registration Succesful!',
				body: '<p>Dear {name},</p> Welcome to {appName}. You have taken your first step towards connecting, learning, and solving with members of your community and we are excited to have you here!',
				status: 'active',
				deleted: false,
				createdAt: '2022-01-12T16:17:03+05:30',
				updatedAt: '2022-01-12T16:17:03+05:30',
				emailFooter: 'email_footer',
				emailHeader: 'email_header',
			},
			{
				type: 'email',
				code: 'emailotp',
				subject: 'MentorED - Reset Otp',
				body: '<p>Dear {name},</p> Your OTP to reset your password is {otp}. Please enter the OTP to reset your password. For your security, please do not share this OTP with anyone.',
				status: 'active',
				deleted: false,
				createdAt: '2022-01-12T16:17:13+05:30',
				updatedAt: '2022-01-12T16:17:13+05:30',
				emailFooter: 'email_footer',
				emailHeader: 'email_header',
			},
			{
				type: 'email',
				code: 'registrationotp',
				subject: 'Your OTP to sign-up on MentorED',
				body: '<div><p>Dear {name},</p> Your OTP to complete the registration process is {otp}. Please enter the OTP to complete the registration. For your security, please do not share this OTP with anyone.</div>',
				status: 'active',
				deleted: false,
				createdAt: '2021-12-06T13:17:03+05:30',
				updatedAt: '2021-12-06T13:17:03+05:30',
				emailFooter: 'email_footer',
				emailHeader: 'email_header',
			},
			{
				type: 'emailFooter',
				code: 'email_footer',
				body: "</div><div style='margin-top:20px;text-align:center;'><div>Regards,</div><div>Team MentorED</div><div style='margin-top:20px;color:#b13e33;text-align:center'><div>Note: Do not reply to this email. This email is sent from an unattended mailbox. Replies will not be read.</div><div>For any queries, please feel free to reach out to us at support@shikshalokam.org</div></div></div></div>",
				status: 'active',
				deleted: false,
				createdAt: '2021-12-06T13:15:13+05:30',
				updatedAt: '2021-12-06T13:15:13+05:30',
			},
			{
				type: 'emailHeader',
				code: 'email_header',
				body: "<div style='margin:auto;width:100%;max-width:650px;'><p style='text-align:center'><img class='imgPath' style='width:35%' alt='MentorED' src='https://mentoring-dev-storage.s3.ap-south-1.amazonaws.com/email/image/emailLogo.png'></p><div style='text-align:center'>",
				status: 'active',
				deleted: false,
				createdAt: '2021-12-06T13:15:13+05:30',
				updatedAt: '2021-12-06T13:15:13+05:30',
			},
		]
		await db.collection('notificationTemplates').insertMany(notificationTemplates)
	},

	async down(db) {
		// return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
	},
}
