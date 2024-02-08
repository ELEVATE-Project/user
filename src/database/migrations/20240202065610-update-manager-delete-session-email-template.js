// Description : Migration is added to update session_deleted_by_manager email-template
'use strict'
/** @type {import('sequelize-cli').Migration} */

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const defaultOrgId = queryInterface.sequelize.options.defaultOrgId
		if (!defaultOrgId) {
			throw new Error('Default org ID is undefined. Please make sure it is set in sequelize options.')
		}

		let updateData = {
			body: '<div><p>Dear {name},</p><p>I hope this message finds you well. I regret to inform you that the previously scheduled mentoring session has been canceled. Please find the details below:</p><p><strong>Canceled Session Details:</strong></p><ul><li><strong>Date:</strong> {startDate}</li><li><strong>Time:</strong> {startTime}</li><li><strong>Duration:</strong> {sessionDuration} {unitOfTime}</li><li><strong>Topic:</strong> {sessionTitle}</li></ul><p>We understand that your time is valuable, and we sincerely apologize for any inconvenience this may cause. Thank you for your continued commitment to the mentoring program. Your dedication is instrumental in creating a positive and supportive mentoring experience.</p></div>',
		}
		let updateFilter = {
			code: 'session_deleted_by_manager',
			organization_id: defaultOrgId,
		}
		// Update operation
		let check = await queryInterface.bulkUpdate('notification_templates', updateData, updateFilter)
	},

	down: async (queryInterface, Sequelize) => {
		const defaultOrgId = queryInterface.sequelize.options.defaultOrgId
		if (!defaultOrgId) {
			throw new Error('Default org ID is undefined. Please make sure it is set in sequelize options.')
		}

		let updateData = {
			body: '<div><p>Dear {name},</p><p>I regret to inform you that the previously scheduled mentoring session has been canceled. Please find the details below:</p><p><strong>Canceled Session Details:</strong></p><ul><li><strong>Date:</strong> {startDate}</li><li><strong>Time:</strong> {startTime}</li><li><strong>Duration:</strong> {sessionDuration} {unitOfTime}</li><li><strong>Topic:</strong> {sessionTitle}</li></ul><p>We understand that your time is valuable, and we sincerely apologize for any inconvenience this may cause. Thank you for your continued commitment to the mentoring program. Your dedication is instrumental in creating a positive and supportive mentoring experience.</p></div>',
		}
		let updateFilter = {
			code: 'session_deleted_by_manager',
			organization_id: defaultOrgId,
		}
		// Update operation
		await queryInterface.bulkUpdate('notification_templates', updateData, updateFilter)
	},
}
