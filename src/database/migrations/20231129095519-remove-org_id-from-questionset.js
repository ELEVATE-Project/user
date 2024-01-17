'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn('question_sets', 'organization_id')
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('question_sets', 'organization_id', {
			type: Sequelize.INTEGER,
			allowNull: false,
		})
	},
}
