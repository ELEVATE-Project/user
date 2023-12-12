'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		// Remove the current primary key constraint
		await queryInterface.removeConstraint('users_credentials', 'users_credentials_pkey')

		// Add the 'email' column as the new primary key
		await queryInterface.addConstraint('users_credentials', {
			fields: ['email'],
			type: 'primary key',
			name: 'users_credentials_pkey',
		})
	},

	async down(queryInterface, Sequelize) {
		// Remove the current primary key constraint
		await queryInterface.removeConstraint('users_credentials', 'users_credentials_email_pkey')

		// Recreate the primary key constraint on the 'id' column
		await queryInterface.addConstraint('users_credentials', {
			fields: ['id'],
			type: 'primary key',
			name: 'users_credentials_pkey',
		})
	},
}
