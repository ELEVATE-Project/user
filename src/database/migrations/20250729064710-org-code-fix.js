const { QueryTypes } = require('sequelize')

module.exports = {
	async up(queryInterface) {
		let transaction
		const ORG_FETCH_QUERY = `SELECT id, name, code FROM organizations WHERE code ~ '\\s+' OR code ~ '[A-Z]';`
		const disableFK = (table, fk_name) => `ALTER TABLE ${table} DROP CONSTRAINT IF EXISTS ${fk_name};`
		const enableFK = (table, fk_name, fkey, refTable, refKey) =>
			`ALTER TABLE ${table} ADD CONSTRAINT ${fk_name} FOREIGN KEY ${fkey} REFERENCES ${refTable} ${refKey} ON UPDATE NO ACTION ON DELETE CASCADE;`
		const updateQuery = (table, key) =>
			`UPDATE ${table} SET ${key} = LOWER(REGEXP_REPLACE(${key}, '\\s+', '_', 'g')) WHERE ${key} ~ '[A-Z\\s]';`

		try {
			// Check if any rows need changing before opening a transaction
			const fetchOrg = await queryInterface.sequelize.query(ORG_FETCH_QUERY, {
				type: QueryTypes.SELECT,
				raw: true,
			})

			if (!fetchOrg || fetchOrg.length === 0) {
				return
			}

			// Start transaction only when we need to make changes
			transaction = await queryInterface.sequelize.transaction()

			const fk_retainer = []

			// organization_registration_codes
			fk_retainer.push(
				enableFK(
					'organization_registration_codes',
					'fk_organization_code_tenant_code_in_org_reg_code',
					'(organization_code, tenant_code)',
					'organizations',
					'(code, tenant_code)'
				)
			)
			await queryInterface.sequelize.query(
				disableFK('organization_registration_codes', 'fk_organization_code_tenant_code_in_org_reg_code'),
				{ transaction }
			)

			// user_organizations
			fk_retainer.push(
				enableFK(
					'user_organizations',
					'fk_user_organizations_organizations',
					'(organization_code, tenant_code)',
					'organizations',
					'(code, tenant_code)'
				)
			)
			await queryInterface.sequelize.query(
				disableFK('user_organizations', 'fk_user_organizations_organizations'),
				{ transaction }
			)

			// organization_user_invites - first FK
			fk_retainer.push(
				enableFK(
					'organization_user_invites',
					'fk_org_user_invites_organization_id',
					'(organization_code, tenant_code)',
					'organizations',
					'(code, tenant_code)'
				)
			)
			await queryInterface.sequelize.query(
				disableFK('organization_user_invites', 'fk_org_user_invites_organization_id'),
				{ transaction }
			)

			// organization_user_invites - second FK
			fk_retainer.push(
				enableFK(
					'organization_user_invites',
					'fk_org_user_invites_org_code',
					'(organization_code, tenant_code)',
					'organizations',
					'(code, tenant_code)'
				)
			)
			await queryInterface.sequelize.query(
				disableFK('organization_user_invites', 'fk_org_user_invites_org_code'),
				{ transaction }
			)

			// user_organization_roles
			fk_retainer.push(
				enableFK(
					'user_organization_roles',
					'fk_user_org_roles_user_organizations',
					'(user_id, organization_code, tenant_code)',
					'user_organizations',
					'(user_id, organization_code, tenant_code)'
				)
			)
			await queryInterface.sequelize.query(
				disableFK('user_organization_roles', 'fk_user_org_roles_user_organizations'),
				{ transaction }
			)

			// organization_features
			fk_retainer.push(
				enableFK(
					'organization_features',
					'fk_org_features_organization',
					'(organization_code, tenant_code)',
					'organizations',
					'(code, tenant_code)'
				)
			)
			await queryInterface.sequelize.query(disableFK('organization_features', 'fk_org_features_organization'), {
				transaction,
			})

			// Run updates
			await queryInterface.sequelize.query(updateQuery('organizations', 'code'), { transaction })
			await queryInterface.sequelize.query(updateQuery('organization_registration_codes', 'organization_code'), {
				transaction,
			})
			await queryInterface.sequelize.query(updateQuery('organization_user_invites', 'organization_code'), {
				transaction,
			})
			await queryInterface.sequelize.query(updateQuery('user_organizations', 'organization_code'), {
				transaction,
			})
			await queryInterface.sequelize.query(updateQuery('user_organization_roles', 'organization_code'), {
				transaction,
			})
			await queryInterface.sequelize.query(updateQuery('organization_features', 'organization_code'), {
				transaction,
			})

			// Verify (optional)
			const fetchOrgs = await queryInterface.sequelize.query(ORG_FETCH_QUERY, {
				type: QueryTypes.SELECT,
				raw: true,
				transaction,
			})

			// Re-create foreign keys
			for (const q of fk_retainer) {
				await queryInterface.sequelize.query(q, { transaction })
			}

			await transaction.commit()
		} catch (err) {
			if (transaction) await transaction.rollback()
			console.error('Error during migration:', err)
			throw err
		}
	},

	async down() {
		console.warn('Down migration not implemented.')
	},
}
