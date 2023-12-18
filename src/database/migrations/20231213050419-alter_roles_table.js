'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('user_roles', 'visibility', {
			type: Sequelize.STRING,
			allowNull: false,
		})
		await queryInterface.addColumn('user_roles', 'organization_id', {
			type: Sequelize.INTEGER,
			allowNull: false,
		})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn('user_roles', 'visiblity')
		await queryInterface.removeColumn('user_roles', 'organization_id')
	},
}
