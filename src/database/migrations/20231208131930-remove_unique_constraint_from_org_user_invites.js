'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.removeConstraint('organization_user_invites', 'org_user_invites_email_key')
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.addConstraint('organization_user_invites', {
			fields: ['email'],
			type: 'unique',
			name: 'org_user_invites_email_key',
		})
	},
}
