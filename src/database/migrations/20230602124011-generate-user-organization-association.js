'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addConstraint('users', {
			fields: ['organization_id'],
			type: 'foreign key',
			name: 'fk_users_organization_id',
			references: {
				table: 'organizations',
				field: 'id',
			},
			onDelete: 'cascade',
			onUpdate: 'cascade',
		})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeConstraint('users', 'fk_users_organization_id')
	},
}
