const { Sequelize } = require('sequelize')
require('dotenv').config({ path: '../../.env' })

// Environment setup
const nodeEnv = process.env.NODE_ENV || 'development'

let fk_retainer = []
let table, fk_name, fkey, refTable, refKey
let databaseUrl

switch (nodeEnv) {
	case 'production':
		databaseUrl = process?.env?.PROD_DATABASE_URL || process.env.DEV_DATABASE_URL
		break
	case 'test':
		databaseUrl = process?.env?.TEST_DATABASE_URL || process.env.DEV_DATABASE_URL
		break
	default:
		databaseUrl = process.env.DEV_DATABASE_URL
}

console.info('Database selected: ', databaseUrl.split('/').at(-1))

// Initialize Sequelize
const sequelize = new Sequelize(databaseUrl, {
	dialect: 'postgres',
	logging: process.env.NODE_ENV === 'development' ? console.log : false,
})

;(async () => {
	let transaction
	try {
		// Start a transaction
		transaction = await sequelize.transaction()

		const DISABLE_FK_QUERY = 'SET CONSTRAINTS ALL DEFERRED' // temporarily remove constraint checks till the transaction is completed

		const ORG_FETCH_QUERY = `SELECT id, name, code FROM organizations WHERE code ~ '\s+';`
		const disableFK = (table, fk_name) => `ALTER TABLE ${table} DROP CONSTRAINT IF EXISTS ${fk_name};`
		const enableFK = (table, fk_name, fkey, refTable, refKey) =>
			`ALTER TABLE ${table} ADD CONSTRAINT ${fk_name} FOREIGN KEY ${fkey} REFERENCES ${refTable} ${refKey} ON UPDATE NO ACTION ON DELETE CASCADE;`
		const updateQuery = (table, key) =>
			`UPDATE ${table} SET ${key} = REGEXP_REPLACE(${key}, '\\s+', '', 'g') WHERE ${key} ~ '\\s+';`

		// Execute the query with replacements
		const fetchOrg = await sequelize.query(ORG_FETCH_QUERY, {
			type: Sequelize.QueryTypes.SELECT,
			raw: true,
			transaction,
		})

		console.log(fetchOrg)
		// Test database connection
		await sequelize.authenticate()
		console.log('Database connection established successfully.')

		table = 'organization_registration_codes'
		fk_name = 'fk_organization_code_tenant_code_in_org_reg_code'
		fkey = '(organization_code, tenant_code)'
		refTable = 'organizations'
		refKey = '(code, tenant_code)'
		fk_retainer.push(enableFK(table, fk_name, fkey, refTable, refKey))
		await sequelize.query(disableFK(table, fk_name), { type: Sequelize.QueryTypes.RAW, raw: true, transaction })
		await sequelize.query(DISABLE_FK_QUERY, { type: Sequelize.QueryTypes.RAW, raw: true, transaction })

		table = 'user_organizations'
		fk_name = 'fk_user_organizations_organizations'
		fkey = '(organization_code, tenant_code)'
		refTable = 'organizations'
		refKey = '(code, tenant_code)'
		await sequelize.query(disableFK(table, fk_name), { type: Sequelize.QueryTypes.RAW, raw: true, transaction })
		fk_retainer.push(enableFK(table, fk_name, fkey, refTable, refKey))

		table = 'organization_user_invites'
		fk_name = 'fk_org_user_invites_org_code'
		fkey = '(organization_code, tenant_code)'
		refTable = 'organizations'
		refKey = '(code, tenant_code)'
		await sequelize.query(disableFK(table, fk_name), { type: Sequelize.QueryTypes.RAW, raw: true, transaction })
		await sequelize.query(DISABLE_FK_QUERY, { type: Sequelize.QueryTypes.RAW, raw: true, transaction })
		fk_retainer.push(enableFK(table, fk_name, fkey, refTable, refKey))

		table = 'organization_user_invites'
		fk_name = 'fk_org_user_invites_organization_id'
		fkey = '(organization_code, tenant_code)'
		refTable = 'organizations'
		refKey = '(code, tenant_code)'
		await sequelize.query(disableFK(table, fk_name), { type: Sequelize.QueryTypes.RAW, raw: true, transaction })
		await sequelize.query(DISABLE_FK_QUERY, { type: Sequelize.QueryTypes.RAW, raw: true, transaction })
		fk_retainer.push(enableFK(table, fk_name, fkey, refTable, refKey))

		table = 'user_organization_roles'
		fk_name = 'fk_user_org_roles_user_organizations'
		fkey = '(user_id, organization_code, tenant_code)'
		refTable = 'user_organizations'
		refKey = '(user_id, organization_code, tenant_code)'
		await sequelize.query(disableFK(table, fk_name), { type: Sequelize.QueryTypes.RAW, raw: true, transaction })
		await sequelize.query(DISABLE_FK_QUERY, { type: Sequelize.QueryTypes.RAW, raw: true, transaction })
		fk_retainer.push(enableFK(table, fk_name, fkey, refTable, refKey))

		let updateTable = 'organizations'
		let key = 'code'
		// Execute the query with replacements
		const updateOrgs = await sequelize.query(updateQuery(updateTable, key), {
			type: Sequelize.QueryTypes.UPDATE,
			raw: true,
			transaction,
		})
		console.log('------------>>', updateOrgs)
		updateTable = 'organization_registration_codes'
		key = 'organization_code'
		// Execute the query with replacements
		await sequelize.query(updateQuery(updateTable, key), {
			type: Sequelize.QueryTypes.UPDATE,
			raw: true,
			transaction,
		})

		updateTable = 'organization_user_invites'
		key = 'organization_code'
		// Execute the query with replacements
		await sequelize.query(updateQuery(updateTable, key), {
			type: Sequelize.QueryTypes.UPDATE,
			raw: true,
			transaction,
		})

		updateTable = 'user_organizations'
		key = 'organization_code'
		// Execute the query with replacements
		await sequelize.query(updateQuery(updateTable, key), {
			type: Sequelize.QueryTypes.UPDATE,
			raw: true,
			transaction,
		})
		updateTable = 'user_organization_roles'
		key = 'organization_code'
		// Execute the query with replacements
		await sequelize.query(updateQuery(updateTable, key), {
			type: Sequelize.QueryTypes.UPDATE,
			raw: true,
			transaction,
		})

		// Execute the query with replacements
		const fetchOrgs = await sequelize.query(ORG_FETCH_QUERY, {
			type: Sequelize.QueryTypes.SELECT,
			raw: true,
			transaction,
		})

		console.log(fetchOrgs)
		let fk_retainerPromise = []
		for (let i = 0; i < fk_retainer.length; i++) {
			fk_retainerPromise.push(
				sequelize.query(fk_retainer[i], {
					type: Sequelize.QueryTypes.UPDATE,
					raw: true,
					transaction,
				})
			)
		}

		await Promise.all(fk_retainerPromise)

		if (transaction) await transaction.commit()

		console.log('Transaction committed successfully.')
	} catch (error) {
		// Rollback transaction on error
		if (transaction) await transaction.rollback()
		console.error(`Error during transaction: ${error}`)
	} finally {
		sequelize.close()
	}
})()
