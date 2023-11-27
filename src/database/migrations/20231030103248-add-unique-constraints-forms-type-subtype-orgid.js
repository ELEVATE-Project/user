'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addConstraint('forms', {
			fields: ['type', 'sub_type', 'organization_id'],
			type: 'unique',
			name: 'unique_type_sub_type_org_id',
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
