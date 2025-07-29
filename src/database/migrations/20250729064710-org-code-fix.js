const { Sequelize } = require('sequelize')

module.exports = {
	async up(queryInterface, Sequelize) {
		let transaction
		let fk_retainer = []
		let table, fk_name, fkey, refTable, refKey

		try {
			// Start a transaction
			transaction = await queryInterface.sequelize.transaction()

			const ORG_FETCH_QUERY = `SELECT id, name, code FROM organizations WHERE code ~ '\\s+' OR code ~ '[A-Z]';`
			const disableFK = (table, fk_name) => `ALTER TABLE ${table} DROP CONSTRAINT IF EXISTS ${fk_name};`
			const enableFK = (table, fk_name, fkey, refTable, refKey) =>
				`ALTER TABLE ${table} ADD CONSTRAINT ${fk_name} FOREIGN KEY ${fkey} REFERENCES ${refTable} ${refKey} ON UPDATE NO ACTION ON DELETE CASCADE;`
			const updateQuery = (table, key) =>
				`UPDATE ${table} SET ${key} = LOWER(REGEXP_REPLACE(${key}, '\\s+', '_', 'g')) WHERE ${key} ~ '[A-Z|\\s+]';`

			// Execute the query to fetch organizations with whitespace
			const fetchOrg = await queryInterface.sequelize.query(ORG_FETCH_QUERY, {
				type: Sequelize.QueryTypes.SELECT,
				raw: true,
				transaction,
			})

			if (fetchOrg.length > 0) {
				// Disable foreign key constraints and store enable queries
				table = 'organization_registration_codes'
				fk_name = 'fk_organization_code_tenant_code_in_org_reg_code'
				fkey = '(organization_code, tenant_code)'
				refTable = 'organizations'
				refKey = '(code, tenant_code)'
				fk_retainer.push(enableFK(table, fk_name, fkey, refTable, refKey))
				await queryInterface.sequelize.query(disableFK(table, fk_name), {
					type: Sequelize.QueryTypes.RAW,
					raw: true,
					transaction,
				})

				table = 'user_organizations'
				fk_name = 'fk_user_organizations_organizations'
				fkey = '(organization_code, tenant_code)'
				refTable = 'organizations'
				refKey = '(code, tenant_code)'
				await queryInterface.sequelize.query(disableFK(table, fk_name), {
					type: Sequelize.QueryTypes.RAW,
					raw: true,
					transaction,
				})
				fk_retainer.push(enableFK(table, fk_name, fkey, refTable, refKey))

				table = 'organization_user_invites'
				fk_name = 'fk_org_user_invites_org_code'
				fkey = '(organization_code, tenant_code)'
				refTable = 'organizations'
				refKey = '(code, tenant_code)'
				await queryInterface.sequelize.query(disableFK(table, fk_name), {
					type: Sequelize.QueryTypes.RAW,
					raw: true,
					transaction,
				})
				fk_retainer.push(enableFK(table, fk_name, fkey, refTable, refKey))

				table = 'organization_user_invites'
				fk_name = 'fk_org_user_invites_organization_id'
				fkey = '(organization_code, tenant_code)'
				refTable = 'organizations'
				refKey = '(code, tenant_code)'
				await queryInterface.sequelize.query(disableFK(table, fk_name), {
					type: Sequelize.QueryTypes.RAW,
					raw: true,
					transaction,
				})

				table = 'user_organization_roles'
				fk_name = 'fk_user_org_roles_user_organizations'
				fkey = '(user_id, organization_code, tenant_code)'
				refTable = 'user_organizations'
				refKey = '(user_id, organization_code, tenant_code)'
				await queryInterface.sequelize.query(disableFK(table, fk_name), {
					type: Sequelize.QueryTypes.RAW,
					raw: true,
					transaction,
				})
				fk_retainer.push(enableFK(table, fk_name, fkey, refTable, refKey))

				// Update tables to remove whitespace
				let updateTable = 'organizations'
				let key = 'code'
				const updateOrgs = await queryInterface.sequelize.query(updateQuery(updateTable, key), {
					type: Sequelize.QueryTypes.UPDATE,
					raw: true,
					transaction,
				})

				updateTable = 'organization_registration_codes'
				key = 'organization_code'
				await queryInterface.sequelize.query(updateQuery(updateTable, key), {
					type: Sequelize.QueryTypes.UPDATE,
					raw: true,
					transaction,
				})

				updateTable = 'organization_user_invites'
				key = 'organization_code'
				await queryInterface.sequelize.query(updateQuery(updateTable, key), {
					type: Sequelize.QueryTypes.UPDATE,
					raw: true,
					transaction,
				})

				updateTable = 'user_organizations'
				key = 'organization_code'
				await queryInterface.sequelize.query(updateQuery(updateTable, key), {
					type: Sequelize.QueryTypes.UPDATE,
					raw: true,
					transaction,
				})

				updateTable = 'user_organization_roles'
				key = 'organization_code'
				await queryInterface.sequelize.query(updateQuery(updateTable, key), {
					type: Sequelize.QueryTypes.UPDATE,
					raw: true,
					transaction,
				})

				// Verify the update
				const fetchOrgs = await queryInterface.sequelize.query(ORG_FETCH_QUERY, {
					type: Sequelize.QueryTypes.SELECT,
					raw: true,
					transaction,
				})
				console.log(fetchOrgs)

				// Re-enable foreign key constraints
				let fk_retainerPromise = []
				for (let i = 0; i < fk_retainer.length; i++) {
					fk_retainerPromise.push(
						queryInterface.sequelize.query(fk_retainer[i], {
							type: Sequelize.QueryTypes.RAW,
							raw: true,
							transaction,
						})
					)
				}

				await Promise.all(fk_retainerPromise)

				// Commit the transaction
				await transaction.commit()
				console.log('Transaction committed successfully.')
			}
		} catch (error) {
			// Rollback transaction on error
			if (transaction) await transaction.rollback()
			console.error(`Error during transaction: ${error}`)
			throw error
		}
	},

	async down(queryInterface, Sequelize) {
		console.warn(
			'Down migration not implemented: Cannot reliably restore original whitespace in organization codes.'
		)
	},
}
