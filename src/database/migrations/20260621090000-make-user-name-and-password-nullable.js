'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
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
