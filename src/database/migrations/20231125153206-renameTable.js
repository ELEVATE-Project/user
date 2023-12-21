'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await Promise.all([
			queryInterface.renameTable('org_domains', 'organization_domains'),
			queryInterface.renameTable('org_role_requests', 'organization_role_requests'),
			queryInterface.renameTable('org_user_invites', 'organization_user_invites'),
		])
	},

	down: async (queryInterface, Sequelize) => {
		await Promise.all([
			queryInterface.renameTable('organization_domains', 'org_domains'),
			queryInterface.renameTable('organization_role_requests', 'org_role_requests'),
			queryInterface.renameTable('organization_user_invites', 'org_user_invites'),
		])
	},
}
