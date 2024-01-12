const mongoose = require('mongoose')
require('dotenv').config({ path: '../.env' })
require('../configs/mongodb')()
const NotificationTemplate = require('../db/notification-template/model')

const updates = [
	{
		body: "{{default}}<div><p>Dear {name},</p> The live session scheduled by you - {sessionTitle} begins in 1 hour. Please ensure that you join at least 10 minutes before for the set time to allow Mentees to settle in.</div>{{/default}}{{linkWarning}}<div><p>Please add meeting link for your scheduled session that starts in less than 1 hour. To add a meeting link, click on the 'edit session' option in session details page of AP-MentorED.</div></p>{{/linkWarning}}",
		subject: 'AP-MentorED - Your scheduled session starts in 1 hour',
		code: 'mentor_one_hour_before_session_reminder',
	},
	{
		body: '<p>Dear {name},</p> The live session you have enrolled in {sessionTitle} begins in 15 minutes. Please ensure that you join at least 5 minutes before for the session to begin on time.',
		subject: 'AP-MentorED - Your enrolled session starts in 15 minutes',
		code: 'mentee_session_reminder',
	},
	{
		body: "{{default}}<p>Dear {name},</p> The live session scheduled by you - {sessionTitle} is scheduled in 24 hours from now. Please ensure that you join at least ten minutes before the set time to allow Mentees to settle in.{{/default}}{{linkWarning}}<div><p>Please add meeting link for your scheduled session that starts in less than 24 hours. To add a meeting link, click on the 'edit session' option in session details page of AP-MentorED.</div></p>{{/linkWarning}}",
		subject: 'AP-MentorED - Your scheduled session starts in 24 hours',
		code: 'mentor_session_reminder',
	},
	{
		body: '<p>Dear {name},</p> Please note that the Mentor has cancelled the session - {sessionTitle}.',
		subject: 'AP-MentorED - Changes updated in your session',
		code: 'mentor_session_delete',
	},
	{
		body: '<p>Dear {name},</p> Please note that the Mentor has rescheduled the session - {sessionTitle} from {oldStartDate} {oldStartTime} - {oldEndDate} {oldEndTime} to {newStartDate} {newStartTime} - {newEndDate} {newEndTime} Please make note of the changes.',
		subject: 'AP-MentorED - Changes in your enrolled session',
		code: 'mentor_session_reschedule',
	},
	{
		body: "<div><p>Dear {name}, </p> You have cancelled your enrollment for the session - {sessionTitle} by {mentorName} Please explore 'All sessions' on your app to enroll for new sessions of your choice.</div>",
		subject: 'AP-MentorED - Changes in your enrolled session',
		code: 'mentee_session_cancel',
	},
	{
		body: "<p>Dear {name},</p> Thank you for enrolling for the session - {sessionTitle} by {mentorName}, The session is scheduled on {startDate} at {startTime} You will be able to join from 'My sessions' on the app once the host starts the meeting.",
		subject: 'AP-MentorED - Session Enrollment Details',
		code: 'mentee_session_enrollment',
	},
	{
		body: '<div><p>Hi Team,</p><p>{role} {name}, is facing an issue in <b>{description}</b> -{userEmailId},User ID: <b>{userId}</b> .</p><p>Kindly look into it.</p><div style="background-color: #f5f5f5; padding: 10px; margin-top: 10px;"><p><b>Meta Information:</b></p><ul style="list-style-type: none; padding: 0;">{metaItems}</ul></div></div>',
		subject: 'AP-MentorED - Support request for AP-MentorED',
		code: 'user_issue_reported',
	},
	{
		code: 'email_header',
		body: "<div style='margin:auto;width:100%;max-width:650px;'><p style='text-align:center'><img class='imgPath' style='width:35%' alt='AP-MentorED' src='https://ap-mentoring-prod-storage.s3.ap-south-1.amazonaws.com/public/emailLogo.png'></p><div style='text-align:center'>",
		subject: null,
	},
	{
		code: 'email_footer',
		body: "</div><div style='margin-top:20px;text-align:center;'><div>Regards,</div><div>Team AP-MentorED</div><div style='margin-top:20px;color:#b13e33;text-align:center'><div>Note: Do not reply to this email. This email is sent from an unattended mailbox. Replies will not be read.</div><div>For any queries, please feel free to reach out to us at apmentored-support@shikshalokam.org</div></div></div></div>",
		subject: null,
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
