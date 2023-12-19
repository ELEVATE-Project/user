'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const defaultOrgId = queryInterface.sequelize.options.defaultOrgId

		if (!defaultOrgId) {
			throw new Error('Default org ID is undefined. Please make sure it is set in sequelize options.')
		}

		// Update the body of the row with id = 7
		return queryInterface.bulkUpdate(
			'notification_templates',
			{
				body: '<p>Dear {name},</p> Please note that the Mentor has rescheduled the session - {sessionTitle} from {oldStartDate} {oldStartTime} - {oldEndDate} {oldEndTime} to {newStartDate} {newStartTime} - {newEndDate} {newEndTime} Please make note of the changes.',
				updated_at: new Date(),
			},
			{
				id: 7,
				organization_id: defaultOrgId,
			}
		)
	},
	down: async (queryInterface, Sequelize) => {
		const defaultOrgId = queryInterface.sequelize.options.defaultOrgId

		if (!defaultOrgId) {
			throw new Error('Default org ID is undefined. Please make sure it is set in sequelize options.')
		}

		// Revert the update if needed
		return queryInterface.bulkUpdate(
			'notification_templates',
			{
				body: '<p>Dear {name},</p> Please note that the Mentor has rescheduled the session - {sessionTitle} from {oldStartDate} {oldStartTime} - {oldEndDate} {oldEndTime} to {newStartDate} {newStartTime} - {newStartDate} {newStartTime} Please make note of the changes.',
				updated_at: new Date(),
			},
			{
				id: 7,
				organization_id: defaultOrgId,
			}
		)
	},
}
