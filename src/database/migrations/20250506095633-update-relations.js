'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const transaction = await queryInterface.sequelize.transaction()

		try {
			// Create foreign key from user_organizations to users
			await queryInterface.addConstraint('user_organizations', {
				fields: ['user_id', 'tenant_code'],
				type: 'foreign key',
				name: 'fk_user_organizations_users',
				references: {
					table: 'users',
					fields: ['id', 'tenant_code'],
				},

				transaction,
			})

			// Create foreign key from user_organizations to organizations
			await queryInterface.addConstraint('user_organizations', {
				fields: ['organization_code', 'tenant_code'],
				type: 'foreign key',
				name: 'fk_user_organizations_organizations',
				references: {
					table: 'organizations',
					fields: ['code', 'tenant_code'],
				},

				transaction,
			})

			// Create foreign key from user_organization_roles to user_organizations
			await queryInterface.addConstraint('user_organization_roles', {
				fields: ['user_id', 'organization_code', 'tenant_code'],
				type: 'foreign key',
				name: 'fk_user_org_roles_user_organizations',
				references: {
					table: 'user_organizations',
					fields: ['user_id', 'organization_code', 'tenant_code'],
				},

				transaction,
			})

			// Add indexes to improve query performance
			await queryInterface.addIndex('users', ['tenant_code'], {
				name: 'idx_users_tenant_code',
				transaction,
			})

			await queryInterface.addIndex('organizations', ['tenant_code'], {
				name: 'idx_organizations_tenant_code',
				transaction,
			})

			await queryInterface.addIndex('user_organizations', ['tenant_code'], {
				name: 'idx_user_organizations_tenant_code',
				transaction,
			})

			await queryInterface.addIndex('user_organizations', ['user_id', 'tenant_code'], {
				name: 'idx_user_organizations_user_tenant',
				transaction,
			})

			await queryInterface.addIndex('user_organizations', ['organization_code', 'tenant_code'], {
				name: 'idx_user_organizations_org_tenant',
				transaction,
			})

			await transaction.commit()
		} catch (error) {
			await transaction.rollback()
			console.log(error)
			throw error
		}
	},

	down: async (queryInterface, Sequelize) => {
		const transaction = await queryInterface.sequelize.transaction()

		try {
			// Remove all indexes
			await queryInterface.removeIndex('user_organizations', 'idx_user_organizations_org_tenant', { transaction })
			await queryInterface.removeIndex('user_organizations', 'idx_user_organizations_user_tenant', {
				transaction,
			})
			await queryInterface.removeIndex('user_organizations', 'idx_user_organizations_tenant_code', {
				transaction,
			})
			await queryInterface.removeIndex('organizations', 'idx_organizations_tenant_code', { transaction })
			await queryInterface.removeIndex('users', 'idx_users_tenant_code', { transaction })

			// Remove all foreign key constraints
			await queryInterface.removeConstraint('user_organization_roles', 'fk_user_org_roles_user_organizations', {
				transaction,
			})
			await queryInterface.removeConstraint('user_organizations', 'fk_user_organizations_organizations', {
				transaction,
			})
			await queryInterface.removeConstraint('user_organizations', 'fk_user_organizations_users', { transaction })

			await transaction.commit()
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	},
}
