'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addConstraint('org_user_invites', {
			fields: ['organization_id'],
			type: 'foreign key',
			name: 'fk_user_invite_organization',
			references: {
				table: 'organizations',
				field: 'id',
			},
			onDelete: 'cascade',
			onUpdate: 'cascade',
		})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeConstraint('org_user_invites', 'fk_user_invite_organization')
	},
}
