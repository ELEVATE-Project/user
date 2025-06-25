'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		// Drop materialized view
		await queryInterface.sequelize.query('DROP MATERIALIZED VIEW IF EXISTS m_users;')

		// Change column
		await queryInterface.changeColumn('users', 'email', {
			type: Sequelize.STRING,
			allowNull: true,
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.sequelize.query('DROP MATERIALIZED VIEW IF EXISTS m_users;')

		await queryInterface.changeColumn('users', 'email', {
			type: Sequelize.STRING,
			allowNull: false,
		})
	},
}
