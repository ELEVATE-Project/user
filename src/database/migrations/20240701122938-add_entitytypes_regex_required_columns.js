'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('entity_types', 'required', {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		})

		await queryInterface.addColumn('entity_types', 'regex', {
			type: Sequelize.STRING,
			allowNull: true, // Making regex column optional
			defaultValue: null, // Default value null for optional column
		})

		// Update the 'required' column for existing data to true
		await queryInterface.sequelize.query('UPDATE entity_types SET required = false;')
	},
	async down(queryInterface, Sequelize) {
		// Remove the 'required' and 'regex' columns from the table
		await queryInterface.removeColumn('entity_types', 'required')
		await queryInterface.removeColumn('entity_types', 'regex')
	},
}
