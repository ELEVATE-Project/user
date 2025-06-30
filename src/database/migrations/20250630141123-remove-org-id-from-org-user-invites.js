'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		return await queryInterface.sequelize.transaction(async (transaction) => {
			await queryInterface.removeColumn('organization_user_invites', 'organization_id')
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('organization_user_invites', 'organization_id', {
			type: Sequelize.STRING(32),
			allowNull: true,
		})
	},
}
