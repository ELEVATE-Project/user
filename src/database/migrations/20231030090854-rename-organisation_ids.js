'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.renameColumn('mentor_extensions', 'organisation_ids', 'visible_to_organizations')
		await queryInterface.renameColumn('sessions', 'organization_ids', 'visible_to_organizations')
		await queryInterface.renameColumn('user_extensions', 'organisation_ids', 'visible_to_organizations')
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.renameColumn('mentor_extensions', 'visible_to_organizations', 'organisation_ids')
		await queryInterface.renameColumn('sessions', 'visible_to_organizations', 'organization_ids')
		await queryInterface.renameColumn('user_extensions', 'visible_to_organizations', 'organisation_ids')
	},
}
