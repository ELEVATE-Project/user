'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		// Add sequence_no to features table
		await queryInterface.addColumn('features', 'sequence_no', {
			type: Sequelize.INTEGER,
		})

		// Add sequence_no to organization_features table
		await queryInterface.addColumn('organization_features', 'sequence_no', {
			type: Sequelize.INTEGER,
		})
	},

	async down(queryInterface, Sequelize) {
		// Remove sequence_no from features table
		await queryInterface.removeColumn('features', 'sequence_no')

		// Remove sequence_no from organization_features table
		await queryInterface.removeColumn('organization_features', 'sequence_no')
	},
}
