'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('sessions', 'created_by', {
			type: Sequelize.INTEGER,
			allowNull: true,
		})
		await queryInterface.addColumn('sessions', 'updated_by', {
			type: Sequelize.INTEGER,
			allowNull: true,
		})
		await queryInterface.addColumn('sessions', 'type', {
			type: Sequelize.STRING,
			allowNull: true,
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn('sessions', 'created_by')
		await queryInterface.removeColumn('sessions', 'type')
		await queryInterface.removeColumn('sessions', 'updated_by')
	},
}
