let emailTemplates = [
	{
		code: 'email_header',
		body: "<div style='margin:auto;width:100%;max-width:650px;'><p style='text-align:center'><img class='imgPath' style='width:35%' alt='MentorED' src='https://mentoring-dev-storage.s3.ap-south-1.amazonaws.com/email/image/emailLogo.png'></p><div style='text-align:center'>",
	},
	{
		code: 'email_footer',
		body: "</div><div style='margin-top:20px;text-align:center;'><div>Regards,</div><div>Team MentorED</div><div style='margin-top:20px;color:#b13e33;text-align:center'><div>Note: Do not reply to this email. This email is sent from an unattended mailbox. Replies will not be read.</div><div>For any queries, please feel free to reach out to us at support@shikshalokam.org</div></div></div></div>",
	},
	{
		code: 'mentor_one_hour_before_session_reminder',
		subject: 'MentorED - Your scheduled session starts in 1 hour',
		body: "{{default}}<div><p>Dear {name},</p> The live session scheduled by you - {sessionTitle} begins in 1 hour. Please ensure that you join at least 10 minutes before for the set time to allow Mentees to settle in.</div>{{/default}}{{linkWarning}}<div><p>Please add meeting link for your scheduled session that starts in less than 1 hour. To add a meeting link, click on the 'edit session' option in session details page of MentorED.</div></p>{{/linkWarning}}",
	},
	{
		code: 'mentee_session_reminder',
		subject: 'MentorED - Your enrolled session starts in 15 minutes',
		body: '<p>Dear {name},</p> The live session you have enrolled in {sessionTitle} begins in 15 minutes. Please ensure that you join at least 5 minutes before for the session to begin on time.',
	},
	{
		code: 'mentor_session_reminder',
		subject: 'MentorED - Your scheduled session starts in 24 hours',
		body: "{{default}}<p>Dear {name},</p> The live session scheduled by you - {sessionTitle} is scheduled in 24 hours from now. Please ensure that you join at least ten minutes before the set time to allow Mentees to settle in.{{/default}}{{linkWarning}}<div><p>Please add meeting link for your scheduled session that starts in less than 24 hours. To add a meeting link, click on the 'edit session' option in session details page of MentorED.</div></p>{{/linkWarning}}",
	},
	{
		code: 'mentor_session_delete',
		subject: 'MentorED - Changes updated in your session',
		body: '<p>Dear {name},</p> Please note that the Mentor has cancelled the session - {sessionTitle}.',
	},
	{
		code: 'mentor_session_reschedule',
		subject: 'MentorED - Changes in your enrolled session',
		body: '<p>Dear {name},</p> Please note that the Mentor has rescheduled the session - {sessionTitle} from {oldStartDate} {oldStartTime} - {oldEndDate} {oldEndTime} to {newStartDate} {newStartTime} - {newEndDate} {newEndTime} Please make note of the changes.',
	},
	{
		code: 'mentee_session_cancel',
		subject: 'MentorED - Changes in your enrolled session',
		body: "<div><p>Dear {name}, </p> You have cancelled your enrollment for the session - {sessionTitle} by {mentorName} Please explore 'All sessions' on your app to enroll for new sessions of your choice.</div>",
	},
	{
		code: 'mentee_session_enrollment',
		subject: 'MentorED - Session Enrollment Details',
		body: "<p>Dear {name},</p> Thank you for enrolling for the session - {sessionTitle} by {mentorName}, The session is scheduled on {startDate} at {startTime} You will be able to join from 'My sessions' on the app once the host starts the meeting.",
	},
]
var moment = require('moment')

module.exports = {
	async up(db) {
		try {
			global.migrationMsg = 'Uploaded email templates'
			let notificationTemplateData = []
			emailTemplates.forEach(async function (emailTemplate) {
				emailTemplate['status'] = 'active'
				emailTemplate['deleted'] = false
				emailTemplate['type'] = 'email'
				emailTemplate['updatedAt'] = moment().format()
				emailTemplate['createdAt'] = moment().format()
				emailTemplate['createdBy'] = 'SYSTEM'
				emailTemplate['updatedBy'] = 'SYSTEM'
				if (emailTemplate.code == 'email_footer') {
					emailTemplate['type'] = 'emailFooter'
				} else if (emailTemplate.code == 'email_header') {
					emailTemplate['type'] = 'emailHeader'
				} else {
					emailTemplate['emailFooter'] = 'email_footer'
					emailTemplate['emailHeader'] = 'email_header'
				}
				notificationTemplateData.push(emailTemplate)
			})
			await db.collection('notificationTemplates').insertMany(notificationTemplateData)
		} catch (error) {
			console.log(error)
		}
	},

	async down(db) {
		db.collection('notificationTemplates').deleteMany({
			code: { $in: emailTemplates.map((emailTemplate) => emailTemplate.code) },
		})
	},
}
