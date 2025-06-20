'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.renameTable('organization_domains', 'organization_email_domains')
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.renameTable('organization_email_domains', 'organization_domains')
	},
}
