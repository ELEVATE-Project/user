'use strict'
/** @type {import('sequelize-cli').Migration} */
let addedRecordIds = [11, 12, 13, 14, 15, 16, 17] // Keep track of added record IDs

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const defaultOrgId = queryInterface.sequelize.options.defaultOrgId
		if (!defaultOrgId) {
			throw new Error('Default org ID is undefined. Please make sure it is set in sequelize options.')
		}

		return queryInterface.bulkInsert('notification_templates', [
			{
				id: 11,
				type: 'email',
				code: 'mentee_session_enrollment_by_manager',
				subject: 'Invited Session Scheduled',
				body: '<div><p>Dear {name},</p><p>I hope this email finds you well. We are excited to inform you that a mentoring session has been scheduled, and you have been invited as the mentee for this session.</p><p><strong>Session Details:</strong></p><ul><li><strong>Date:</strong> {startDate}</li><li><strong>Time:</strong> {startTime}</li><li><strong>Duration:</strong> {sessionDuration} {unitOfTime}</li><li><strong>Session Platform:</strong> {sessionPlatform}</li><li><strong>Topic:</strong> {sessionTitle}</li></ul><p>Make sure to prepare any necessary materials or information for the session. If there are any issues or conflicts with the schedule, please let us know at your earliest convenience so that we can make any necessary adjustments.</p></div>',
				status: 'active',
				organization_id: defaultOrgId,
				created_at: new Date(),
				updated_at: new Date(),
				created_by: null,
				updated_by: null,
				email_footer: 'email_footer',
				email_header: 'email_header',
			},
			{
				id: 12,
				type: 'email',
				code: 'mentor_invite_private_session_by_manager',
				subject: 'Private Session Scheduled',
				body: '<div><p>Dear {name},</p><p>I hope this email finds you well. We are excited to inform you that a mentoring session has been scheduled, and you have been assigned as the mentor for this session.</p><p><strong>Session Details:</strong></p><ul><li><strong>Date:</strong> {startDate}</li><li><strong>Time:</strong> {startTime}</li><li><strong>Duration:</strong> {sessionDuration} {unitOfTime}</li><li><strong>Session Platform:</strong> {sessionPlatform}</li><li><strong>Topic:</strong> {sessionTitle}</li><li><strong>Session Type:</strong> {sessionType}</li></ul><p>Please take note that this is a private session and {noOfMentees} mentees are added to the session. Make sure to prepare any necessary materials or information for the session. If there are any issues or conflicts with the assigned schedule, please let us know at your earliest convenience so that we can make any necessary adjustments. Thank you for your commitment to mentoring. Your guidance and expertise are highly valued, and we appreciate your dedication to supporting the growth and development of our mentees.</p></div>',
				status: 'active',
				organization_id: defaultOrgId,
				created_at: new Date(),
				updated_at: new Date(),
				created_by: null,
				updated_by: null,
				email_footer: 'email_footer',
				email_header: 'email_header',
			},
			{
				id: 13,
				type: 'email',
				code: 'mentor_invite_public_session_by_manager',
				subject: 'Public Session Scheduled',
				body: '<div><p>Dear {name},</p><p>I hope this email finds you well. We are excited to inform you that a mentoring session has been scheduled, and you have been assigned as the mentor for this session.</p><p><strong>Session Details:</strong></p><ul><li><strong>Date:</strong> {startDate}</li><li><strong>Time:</strong> {startTime}</li><li><strong>Duration:</strong> {sessionDuration} {unitOfTime}</li><li><strong>Session Platform:</strong> {sessionPlatform}</li><li><strong>Topic:</strong> {sessionTitle}</li><li><strong>Session Type:</strong> {sessionType}</li></ul><p>Please take note that this is a public session and mentees will be able to enroll in the session. Make sure to prepare any necessary materials or information for the session. If there are any issues or conflicts with the assigned schedule, please let us know at your earliest convenience so that we can make any necessary adjustments.Thank you for your commitment to mentoring. Your guidance and expertise are highly valued, and we appreciate your dedication to supporting the growth and development of our mentees.</p></div>',
				status: 'active',
				organization_id: defaultOrgId,
				created_at: new Date(),
				updated_at: new Date(),
				created_by: null,
				updated_by: null,
				email_footer: 'email_footer',
				email_header: 'email_header',
			},
			{
				id: 14,
				type: 'email',
				code: 'session_deleted_by_manager',
				subject: 'Update: Cancellation of Scheduled Mentoring Session',
				body: '<div><p>Dear {name},</p><p>I regret to inform you that the previously scheduled mentoring session has been canceled. Please find the details below:</p><p><strong>Canceled Session Details:</strong></p><ul><li><strong>Date:</strong> {startDate}</li><li><strong>Time:</strong> {startTime}</li><li><strong>Duration:</strong> {sessionDuration} {unitOfTime}</li><li><strong>Topic:</strong> {sessionTitle}</li></ul><p>We understand that your time is valuable, and we sincerely apologize for any inconvenience this may cause. Thank you for your continued commitment to the mentoring program. Your dedication is instrumental in creating a positive and supportive mentoring experience.</p></div>',
				status: 'active',
				organization_id: defaultOrgId,
				created_at: new Date(),
				updated_at: new Date(),
				created_by: null,
				updated_by: null,
				email_footer: 'email_footer',
				email_header: 'email_header',
			},
			{
				id: 15,
				type: 'email',
				code: 'mentor_session_edited_by_manager_email_template',
				subject: 'Changes to Scheduled Mentoring Session',
				body: '<div><p>Dear {name},</p><p>I trust this email finds you well. I wanted to inform you that there have been some updates to the mentoring session previously scheduled. Please review the changes outlined below:</p><p><strong>Original Session Details:</strong></p><ul><li><strong>Date:</strong> {startDate}</li><li><strong>Time:</strong> {startTime}</li><li><strong>Duration:</strong> {sessionDuration} {unitOfTime}</li><li><strong>Session Platform:</strong> {sessionPlatform}</li><li><strong>Topic:</strong> {originalSessionTitle}</li><li><strong>Session Type:</strong> {sessionType}</li></ul><p><strong>Revised Session Details:</strong></p><ul><li><strong>Date:</strong> {newStartDate}</li><li><strong>Time:</strong> {newStartTime}</li><li><strong>Duration:</strong> {newSessionDuration} {unitOfTime}</li><li><strong>Session Platform:</strong> {newSessionPlatform}</li><li><strong>Topic:</strong> {revisedSessionTitle}</li><li><strong>Session Type:</strong> {newSessionType}</li></ul><p>We understand that schedule changes may impact your availability, and we appreciate your flexibility. If you have any concerns or conflicts with the revised schedule, please let us know as soon as possible so that we can address them accordingly. Thank you for your understanding and continued commitment to mentoring. Your guidance plays a crucial role in the success of our mentoring program, and we value your contributions.</p></div>',
				status: 'active',
				organization_id: defaultOrgId,
				created_at: new Date(),
				updated_at: new Date(),
				created_by: null,
				updated_by: null,
				email_footer: 'email_footer',
				email_header: 'email_header',
			},
			{
				id: 16,
				type: 'email',
				code: 'mentee_session_edited_by_manager_email_template',
				subject: 'Changes to Scheduled Mentoring Session',
				body: '<div><p>Dear {name},</p><p>I trust this email finds you well. I wanted to inform you that there have been some updates to the mentoring session previously scheduled in which you were enrolled. Please review the changes outlined below:</p><p><strong>Original Session Details:</strong></p><ul><li><strong>Date:</strong> {startDate}</li><li><strong>Time:</strong> {startTime}</li><li><strong>Duration:</strong> {sessionDuration} {unitOfTime}</li><li><strong>Session Platform:</strong> {sessionPlatform}</li><li><strong>Topic:</strong> {originalSessionTitle}</li><li><strong>Session Type:</strong> {sessionType}</li></ul><p><strong>Revised Session Details:</strong></p><ul><li><strong>Date:</strong> {newStartDate}</li><li><strong>Time:</strong> {newStartTime}</li><li><strong>Duration:</strong> {newSessionDuration} {unitOfTime}</li><li><strong>Session Platform:</strong> {newSessionPlatform}</li><li><strong>Topic:</strong> {revisedSessionTitle}</li><li><strong>Session Type:</strong> {newSessionType}</li></ul><p>We understand that schedule changes may impact your availability, and we appreciate your flexibility. Thank you for your understanding and continued commitment to mentoring.</p></div>',
				status: 'active',
				organization_id: defaultOrgId,
				created_at: new Date(),
				updated_at: new Date(),
				created_by: null,
				updated_by: null,
				email_footer: 'email_footer',
				email_header: 'email_header',
			},
			{
				id: 17,
				type: 'email',
				code: 'session_title_edited_by_manager_email_template',
				subject: 'Update: Cancellation of Scheduled Mentoring Session',
				body: '<div><p>Dear {name},</p><p>I trust this email finds you well. There has been an update to the mentoring session name. Please review the changes below:<ul><li><strong>Original Session Name::</strong> {originalSessionTitle}</li><li><strong>Revised Session Name:</strong> {revisedSessionTitle}</li></ul><p>We understand that the session name change may impact your session agenda. Thank you for your understanding and continued commitment to mentoring.</p></div>',
				status: 'active',
				organization_id: defaultOrgId,
				created_at: new Date(),
				updated_at: new Date(),
				created_by: null,
				updated_by: null,
				email_footer: 'email_footer',
				email_header: 'email_header',
			},
			// Add more records as needed
		])
	},

	down: async (queryInterface, Sequelize) => {
		return queryInterface.bulkDelete('notification_templates', { id: addedRecordIds })
	},
}
