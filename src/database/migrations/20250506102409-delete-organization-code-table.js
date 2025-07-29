'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		// Drop the table if it exists
		await queryInterface.dropTable('organization_codes')
	},

	down: async (queryInterface, Sequelize) => {},
}
