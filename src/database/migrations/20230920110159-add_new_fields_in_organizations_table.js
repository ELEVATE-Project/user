'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('organizations', 'created_by', {
			type: Sequelize.INTEGER,
			allowNull: true,
		})

		await queryInterface.addColumn('organizations', 'updated_by', {
			type: Sequelize.INTEGER,
			allowNull: true,
		})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn('organizations', 'created_by')
		await queryInterface.removeColumn('organizations', 'updated_by')
	},
}
