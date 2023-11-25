'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await Promise.all([
			queryInterface.renameColumn('entity_types', 'org_id', 'organization_id'),
			queryInterface.renameColumn('forms', 'org_id', 'organization_id'),
			queryInterface.renameColumn('notification_templates', 'org_id', 'organization_id'),
		])
	},

	down: async (queryInterface, Sequelize) => {
		await Promise.all([
			queryInterface.renameColumn('entity_types', 'organization_id', 'org_id'),
			queryInterface.renameColumn('forms', 'organization_id', 'org_id'),
			queryInterface.renameColumn('notification_templates', 'organization_id', 'org_id'),
		])
	},
}
