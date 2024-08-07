'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('entity_types', 'meta', {
			type: Sequelize.JSONB,
			allowNull: true,
		})
		await queryInterface.addColumn('entity_types', 'external_entity_type', {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn('entity_types', 'meta')
		await queryInterface.removeColumn('entity_types', 'external_entity_type')
	},
}
