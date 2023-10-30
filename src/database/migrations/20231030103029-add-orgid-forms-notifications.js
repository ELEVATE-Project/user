'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('notification_templates', 'org_id', {
			type: Sequelize.INTEGER,
			allowNull: true,
		})

		await queryInterface.addColumn('forms', 'org_id', {
			type: Sequelize.INTEGER,
			allowNull: true,
		})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn('notification_templates', 'org_id')
		await queryInterface.removeColumn('forms', 'org_id')
	},
}
