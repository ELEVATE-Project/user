'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('forms', {
			fields: ['type', 'sub_type'],
			type: 'unique',
			name: 'unique_type_sub_type',
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeConstraint('forms', 'unique_type_sub_type')
	},
}
