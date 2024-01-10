'use strict'
/** @type {import('sequelize-cli').Migration} */
let addedRecordIds = [11] // Keep track of added record IDs

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
			// Add more records as needed
		])
	},

	down: async (queryInterface, Sequelize) => {
		return queryInterface.bulkDelete('notification_templates', { id: addedRecordIds })
	},
}
