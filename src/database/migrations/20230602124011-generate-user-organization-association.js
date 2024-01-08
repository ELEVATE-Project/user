'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addConstraint('users', {
			fields: ['organization_id'],
			type: 'foreign key',
			name: 'fk_user_organization',
			references: {
				table: 'organizations',
				field: 'id',
			},
			onDelete: 'cascade',
		})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeConstraint('users', 'fk_user_organization')
	},
}
