'use strict'

module.exports = {
	async up(queryInterface, Sequelize) {
		// Remove the primary key constraint from 'id'
		await queryInterface.removeConstraint('user_sessions', 'user_sessions_pkey')

		// Add a unique constraint for the combination of 'id' and 'user_id'
		await queryInterface.addConstraint('user_sessions', {
			fields: ['id', 'user_id'],
			type: 'primary key',
			name: 'user_sessions_pkey',
		})
	},

	async down(queryInterface, Sequelize) {
		// Remove the unique constraint for the combination of 'id' and 'user_id'
		await queryInterface.removeConstraint('user_sessions', 'user_sessions_pkey')

		// Add back the primary key constraint on 'id'
		await queryInterface.addConstraint('user_sessions', {
			type: 'primary key',
			fields: ['id'],
			name: 'user_sessions_pkey',
		})
	},
}
