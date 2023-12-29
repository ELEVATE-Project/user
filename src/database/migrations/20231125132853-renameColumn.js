'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await Promise.all([
			queryInterface.renameColumn('entity_types', 'org_id', 'organization_id'),
			queryInterface.renameColumn('mentor_extensions', 'org_id', 'organization_id'),
			queryInterface.renameColumn('organisation_extension', 'org_id', 'organization_id'),
			queryInterface.renameColumn('sessions', 'mentor_org_id', 'mentor_organization_id'),
			queryInterface.renameColumn('user_extensions', 'org_id', 'organization_id'),
		])
	},

	down: async (queryInterface, Sequelize) => {
		await Promise.all([
			queryInterface.renameColumn('entity_types', 'organization_id', 'org_id'),
			queryInterface.renameColumn('mentor_extensions', 'organization_id', 'org_id'),
			queryInterface.renameColumn('organisation_extension', 'organization_id', 'org_id'),
			queryInterface.renameColumn('sessions', 'mentor_organization_id', 'mentor_org_id'),
			queryInterface.renameColumn('user_extensions', 'organization_id', 'org_id'),
		])
	},
}
