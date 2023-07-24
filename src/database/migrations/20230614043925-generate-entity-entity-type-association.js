'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addConstraint('entities', {
			fields: ['id'],
			type: 'foreign key',
			name: 'fk_entity_entity_type_id',
			references: {
				table: 'entity_types',
				field: 'id',
			},
			onDelete: 'cascade',
			onUpdate: 'cascade',
		})
	},

	async down(queryInterface, Sequelize) {
		/**
		 * Add reverting commands here.
		 *
		 * Example:
		 * await queryInterface.dropTable('users');
		 */
	},
}
