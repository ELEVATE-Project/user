const { Sequelize } = require('sequelize')
require('dotenv').config({ path: '../.env' })

// Constants
const DEFAULT_ORG = {
	NAME: 'Default Organization',
	CODE: 'default_code',
	DESCRIPTION: 'Default Organisation',
	STATUS: 'ACTIVE',
}

// Database configuration
const getDbConfig = (nodeEnv) => {
	const configs = {
		production: process.env.PROD_DATABASE_URL,
		test: process.env.TEST_DATABASE_URL,
		development: process.env.DEV_DATABASE_URL,
	}
	return configs[nodeEnv] || configs.development
}

// SQL Queries with parameterization
const queries = {
	check: `SELECT id FROM organizations WHERE code = $1 LIMIT 1`,
	insert: `
        INSERT INTO organizations (
            name, code, description, status, updated_at, created_at
        ) VALUES ($1, $2, $3, $4, NOW(), NOW()) 
        RETURNING id
    `,
	insertCode: `
        INSERT INTO organization_codes (
            code, organization_id, updated_at, created_at
        ) VALUES ($1, $2, NOW(), NOW()) 
        RETURNING organization_id
    `,
}

async function insertDefaultOrg() {
	const nodeEnv = process.env.NODE_ENV || 'development'
	const databaseUrl = getDbConfig(nodeEnv)

	if (!databaseUrl) {
		throw new Error(`${nodeEnv} DATABASE_URL not found in environment variables.`)
	}

	const sequelize = new Sequelize(databaseUrl, {
		dialect: 'postgres',
		logging: nodeEnv === 'development' ? console.log : false,
		pool: {
			max: 5,
			min: 0,
			acquire: 30000,
			idle: 10000,
		},
	})

	let transaction

	try {
		await sequelize.authenticate()
		console.log('Database connection established successfully.')

		transaction = await sequelize.transaction()

		// Check existing organization
		const [existingRow] = await sequelize.query(queries.check, {
			bind: [DEFAULT_ORG.CODE],
			transaction,
		})

		if (existingRow.length > 0) {
			console.log(
				`Organization with code '${DEFAULT_ORG.CODE}' already exists (ID: ${existingRow[0].id})`
			)
			await transaction.commit()
			return existingRow[0].id
		}

		// Insert organization
		const [result] = await sequelize.query(queries.insert, {
			bind: [
				DEFAULT_ORG.NAME,
				DEFAULT_ORG.CODE,
				DEFAULT_ORG.DESCRIPTION,
				DEFAULT_ORG.STATUS,
			],
			transaction,
		})

		const orgId = result[0].id

		// Insert organization code
		await sequelize.query(queries.insertCode, {
			bind: [DEFAULT_ORG.CODE, orgId],
			transaction,
		})

		await transaction.commit()
		console.log(
			'Default organization created successfully:',
			`\x1b[1m\x1b[32m${orgId}\x1b[0m`
		)
		return orgId
	} catch (error) {
		if (transaction) await transaction.rollback()
		console.error('Error:', error.message)
		throw error
	} finally {
		await sequelize.close()
	}
}

// Execute with proper error handling
insertDefaultOrg().catch((error) => {
	console.error('Fatal error:', error)
	process.exit(1)
})
