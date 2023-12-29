'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn('questions', 'question_set_id')
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('questions', 'question_set_id', {
			type: Sequelize.INTEGER,
			allowNull: false,
		})
	},
}
