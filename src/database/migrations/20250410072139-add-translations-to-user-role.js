'use strict'

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('user_roles', 'translations', {
			type: Sequelize.JSON, // or Sequelize.JSONB for PostgreSQL
			allowNull: true,
		})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn('user_roles', 'translations')
	},
}
