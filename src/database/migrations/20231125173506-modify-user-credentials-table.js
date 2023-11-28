'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('users_credentials', 'organization_user_invite_id', {
			type: Sequelize.INTEGER,
			allowNull: true,
		})

		await queryInterface.addConstraint('users_credentials', {
			fields: ['email'],
			type: 'unique',
			name: 'users_credentials_email_key',
		})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn('users_credentials', 'organization_user_invite_id')

		await queryInterface.removeConstraint('users_credentials', 'users_credentials_email_key')
	},
}
