'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.renameColumn('entity_types', 'org_id', 'organization_id')
		await queryInterface.renameColumn('forms', 'org_id', 'organization_id')
		await queryInterface.renameColumn('mentor_extensions', 'org_id', 'organization_id')
		await queryInterface.renameColumn('notification_templates', 'org_id', 'organization_id')
		await queryInterface.renameColumn('organisation_extension', 'org_id', 'organization_id')
		await queryInterface.renameColumn('question_sets', 'org_id', 'organization_id')
		await queryInterface.renameColumn('sessions', 'mentor_org_id', 'mentor_organization_id')
		await queryInterface.renameColumn('user_extensions', 'org_id', 'organization_id')
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.renameColumn('entity_types', 'organization_id', 'org_id')
		await queryInterface.renameColumn('forms', 'organization_id', 'org_id')
		await queryInterface.renameColumn('mentor_extensions', 'organization_id', 'org_id')
		await queryInterface.renameColumn('notification_templates', 'organization_id', 'org_id')
		await queryInterface.renameColumn('organisation_extension', 'organization_id', 'org_id')
		await queryInterface.renameColumn('question_sets', 'organization_id', 'org_id')
		await queryInterface.renameColumn('sessions', 'mentor_organization_id', 'mentor_org_id')
		await queryInterface.renameColumn('user_extensions', 'organization_id', 'org_id')
	},
}
