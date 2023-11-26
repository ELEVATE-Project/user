'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('mentor_extensions', 'org_id', {
			type: Sequelize.INTEGER,
		})

		await queryInterface.addColumn('user_extensions', 'org_id', {
			type: Sequelize.INTEGER,
			allowNull: true,
		})

		await queryInterface.addColumn('questions', 'question_set_id', {
			type: Sequelize.INTEGER,
			allowNull: true,
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn('mentor_extensions', 'org_id')
		await queryInterface.removeColumn('user_extensions', 'org_id')
		await queryInterface.removeColumn('questions', 'question_set_id')
	},
}
