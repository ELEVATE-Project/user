'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.changeColumn('organizations', 'description', {
			type: Sequelize.TEXT,
			allowNull: true,
		})

		await queryInterface.changeColumn('users', 'about', {
			type: Sequelize.TEXT,
			allowNull: true,
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.changeColumn('organizations', 'description', {
			type: Sequelize.STRING,
			allowNull: true,
		})

		await queryInterface.changeColumn('users', 'about', {
			type: Sequelize.STRING,
			allowNull: true,
		})
	},
}
