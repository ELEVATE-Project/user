'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		// Drop the materialized view
		await queryInterface.sequelize.query('DROP MATERIALIZED VIEW IF EXISTS m_users')

		// Remove the columns from the users table
		await queryInterface.removeColumn('users', 'last_logged_in_at')
		await queryInterface.removeColumn('users', 'refresh_tokens')
	},

	down: async (queryInterface, Sequelize) => {
		// Add back the columns to the users table
		await queryInterface.addColumn('users', 'last_logged_in_at', {
			type: Sequelize.DATE,
		})
		await queryInterface.addColumn('users', 'refresh_tokens', {
			type: Sequelize.ARRAY(Sequelize.JSONB),
		})
	},
}
