'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('organization_user_invites', 'user_credential_id', {
			type: Sequelize.INTEGER,
			allowNull: true,
		})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn('organization_user_invites', 'user_credential_id')
	},
}
