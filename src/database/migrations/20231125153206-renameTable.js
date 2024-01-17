'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.renameTable('organisation_extension', 'organization_extension')
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.renameTable('organization_extension', 'organisation_extension')
	},
}
