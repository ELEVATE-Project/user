'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		return await queryInterface.sequelize.transaction(async (transaction) => {
			await queryInterface.removeColumn('organizations', 'registration_code')
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('organizations', 'registration_code', {
			type: Sequelize.STRING(32),
			allowNull: true,
		})
	},
}
