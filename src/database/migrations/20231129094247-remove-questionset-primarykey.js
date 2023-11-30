'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.removeConstraint('question_sets', 'question_sets_pkey')
		await queryInterface.addConstraint('question_sets', {
			fields: ['code'],
			type: 'primary key',
			name: 'question_sets_pkey',
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeConstraint('question_sets', 'question_sets_pkey')
		await queryInterface.addConstraint('question_sets', {
			fields: ['organization_id', 'code'],
			type: 'primary key',
			name: 'question_sets_pkey',
		})
	},
}
