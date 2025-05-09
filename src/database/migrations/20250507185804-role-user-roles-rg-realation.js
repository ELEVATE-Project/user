'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('user_organization_roles', {
			fields: ['role_id', 'tenant_code'], // Include all PK columns
			type: 'foreign key',
			name: 'fk_user_organization_roles_role_composite',
			references: {
				table: 'user_roles',
				fields: ['id', 'tenant_code'], // Match the composite PK
			},
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeConstraint('user_organization_roles', 'fk_user_organization_roles_role_composite')
	},
}
