const mongoose = require('mongoose')
require('dotenv').config({ path: '../.env' })
require('../configs/mongodb')()
const NotificationTemplate = require('../db/notification-template/model')

const updates = [
	{
		body: '<p>Dear {name},</p> Welcome to {appName}. You have taken your first step towards connecting, learning, and solving with members of your community and we are excited to have you here!',
		subject: 'AP-MentorED - Registration Successful!',
		code: 'registration',
	},
	{
		body: '<p>Dear {name},</p> Your OTP to reset your password is {otp}. Please enter the OTP to reset your password. For security, please do not share this OTP with anyone.',
		subject: 'AP-MentorED - Reset Otp',
		code: 'emailotp',
	},
	{
		body: '<div><p>Dear {name},</p> Your OTP to complete the registration process is {otp}. Please enter the OTP to complete the registration. For security, please do not share this OTP with anyone.</div>',
		subject: 'Your OTP to sign-up on AP-MentorED',
		code: 'registrationotp',
	},
	{
		body: "</div><div style='margin-top:20px;text-align:center;'><div>Regards,</div><div>Team AP-MentorED</div><div style='margin-top:20px;color:#b13e33;text-align:center'><div>Note: Do not reply to this email. This email is sent from an unattended mailbox. Replies will not be read.</div><div>For any queries, please feel free to reach out to us at apmentored-support@shikshalokam.org</div></div></div></div>",
		code: 'email_footer',
		subject: null,
	},
	{
		body: "<div style='margin:auto;width:100%;max-width:650px;'><p style='text-align:center'><img class='imgPath' style='width:35%' alt='AP-MentorED' src='https://ap-mentoring-prod-storage.s3.ap-south-1.amazonaws.com/public/emailLogo.png'></p><div style='text-align:center'>",
		code: 'email_header',
		subject: null,
	},
	{
		body: '<div><p>Hi Team,</p>{role} {name} is facing issue in <b>{description}</b>-{userEmailId} in 2.1 version of AP-MentorED.</div>',
		subject: 'Support request for AP-MentorED',
		code: 'user_issue_reported',
	},
]

async function updateDocuments() {
	try {
		for (const update of updates) {
			const { code, subject, body } = update

			const filter = { code: code }
			const updateDoc = {
				$set: {
					subject: subject,
					body: body,
				},
			}

			const result = await NotificationTemplate.findOneAndUpdate(filter, updateDoc)

			if (result) {
				console.log(`Updated document with code ${code}`)
			} else {
				console.log(`Document with code ${code} not found`)
			}
		}
	} catch (err) {
		console.error('Error updating documents:', err)
	} finally {
		mongoose.disconnect()
	}
}

updateDocuments()
