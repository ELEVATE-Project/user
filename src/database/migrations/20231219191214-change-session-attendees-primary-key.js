'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		// Update query to delete rows where deleted_at is not null
		//await queryInterface.sequelize.query('DELETE FROM session_attendees WHERE deleted_at IS NOT NULL')

		// Remove the current primary key
		await queryInterface.removeConstraint('session_attendees', 'session_attendees_pkey')

		// Add composite primary key on session_id and mentee_id
		await queryInterface.addConstraint('session_attendees', {
			fields: ['session_id', 'mentee_id'],
			type: 'primary key',
			name: 'session_attendees_pkey',
		})
	},

	down: async (queryInterface, Sequelize) => {
		// Remove the composite primary key
		await queryInterface.removeConstraint('session_attendees', 'session_attendees_pkey')

		// Add back the original primary key
		await queryInterface.addConstraint('session_attendees', {
			fields: ['id'],
			type: 'primary key',
			name: 'session_attendees_pkey',
		})
	},
}
