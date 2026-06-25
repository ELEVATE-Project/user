'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.sequelize.query('DROP MATERIALIZED VIEW IF EXISTS m_users;')

		await queryInterface.changeColumn('users', 'name', {
			type: Sequelize.STRING,
			allowNull: true,
		})

		await queryInterface.changeColumn('users', 'password', {
			type: Sequelize.STRING,
			allowNull: true,
		})

		await queryInterface.changeColumn('users_credentials', 'password', {
			type: Sequelize.STRING,
			allowNull: true,
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.sequelize.query('DROP MATERIALIZED VIEW IF EXISTS m_users;')

		await queryInterface.sequelize.query(`UPDATE users SET name = '' WHERE name IS NULL`)
		await queryInterface.sequelize.query(`UPDATE users SET password = '' WHERE password IS NULL`)
		await queryInterface.sequelize.query(`UPDATE users_credentials SET password = '' WHERE password IS NULL`)
		await queryInterface.changeColumn('users', 'name', {
			type: Sequelize.STRING,
			allowNull: false,
		})

		await queryInterface.changeColumn('users', 'password', {
			type: Sequelize.STRING,
			allowNull: false,
		})

		await queryInterface.changeColumn('users_credentials', 'password', {
			type: Sequelize.STRING,
			allowNull: false,
		})
	},
}
