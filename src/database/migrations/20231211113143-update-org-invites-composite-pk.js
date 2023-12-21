'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		// Remove the current primary key constraint
		await queryInterface.removeConstraint('organization_user_invites', 'org_user_invites_pkey')

		// Add the 'id' and 'organization_id' columns as the new composite primary key
		await queryInterface.addConstraint('organization_user_invites', {
			fields: ['id', 'organization_id'],
			type: 'primary key',
			name: 'org_user_invites_pkey',
		})
	},

	async down(queryInterface, Sequelize) {
		// Remove the current primary key constraint
		await queryInterface.removeConstraint('organization_user_invites', 'org_user_invites_pkey')

		// Recreate the primary key constraint on the 'id' column
		await queryInterface.addConstraint('organization_user_invites', {
			fields: ['id'],
			type: 'primary key',
			name: 'org_user_invites_pkey',
		})
	},
}
