'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('users', 'activated_at', {
			type: Sequelize.DATE,
			allowNull: true,
		})

		await queryInterface.addColumn('users', 'deactivated_at', {
			type: Sequelize.DATE,
			allowNull: true,
		})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn('users', 'activated_at')
		await queryInterface.removeColumn('users', 'deactivated_at')
	},
}
