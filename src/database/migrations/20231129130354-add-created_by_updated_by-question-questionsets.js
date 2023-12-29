'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('questions', 'created_by', {
			type: Sequelize.INTEGER,
			allowNull: true,
		})
		await queryInterface.addColumn('questions', 'updated_by', {
			type: Sequelize.INTEGER,
			allowNull: true,
		})
		await queryInterface.addColumn('question_sets', 'created_by', {
			type: Sequelize.INTEGER,
			allowNull: true,
		})
		await queryInterface.addColumn('question_sets', 'updated_by', {
			type: Sequelize.INTEGER,
			allowNull: true,
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn('questions', 'created_by')
		await queryInterface.removeColumn('questions', 'updated_by')
		await queryInterface.removeColumn('question_sets', 'created_by')
		await queryInterface.removeColumn('question_sets', 'updated_by')
	},
}
