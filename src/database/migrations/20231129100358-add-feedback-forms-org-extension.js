'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('organization_extension', 'mentee_feedback_question_set', {
			type: Sequelize.STRING,
			allowNull: true,
		})

		await queryInterface.addColumn('organization_extension', 'mentor_feedback_question_set', {
			type: Sequelize.STRING,
			allowNull: true,
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn('organization_extension', 'mentee_feedback_question_set')
		await queryInterface.removeColumn('organization_extension', 'mentor_feedback_question_set')
	},
}
