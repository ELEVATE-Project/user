'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('users', 'status_updated_at', {
			type: Sequelize.DATE,
			allowNull: true,
		})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn('users', 'status_updated_at')
	},
}
