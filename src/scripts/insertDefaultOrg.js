const { Sequelize } = require('sequelize')
require('dotenv').config({ path: '../.env' })

const nodeEnv = process.env.NODE_ENV || 'development'

let databaseUrl

switch (nodeEnv) {
	case 'production':
		databaseUrl = process.env.PROD_DATABASE_URL
		break
	case 'test':
		databaseUrl = process.env.TEST_DATABASE_URL
		break
	default:
		databaseUrl = process.env.DEV_DATABASE_URL
}

if (!databaseUrl) {
	console.error(`${nodeEnv} DATABASE_URL not found in environment variables.`)
	process.exit(1)
}

const sequelize = new Sequelize(databaseUrl, {
	dialect: 'postgres',
	logging: process.env.NODE_ENV === 'development' ? console.log : false,
})

// Raw SQL query to check if a row with 'default_code' already exists
const checkQuery = `
    SELECT id FROM organizations WHERE code = 'default_code' LIMIT 1;
`

// Raw SQL query for insertion
const insertQuery = `
    INSERT INTO organizations (name, code, description, status, updated_at, created_at)
    VALUES (?, ?, ?, ?, NOW(), NOW())
    RETURNING id;
`

const insertCodeQuery = `
    INSERT INTO organization_codes (code , organization_id, updated_at, created_at)
    VALUES (?, ?, NOW(), NOW())
    RETURNING organization_id;
`

const defaultValues = ['Default Organization', 'default_code', 'Default Organisation', 'ACTIVE']
const queryParams = defaultValues.map((value, index) => (value === 'default' ? null : value))

;(async () => {
	try {
		// Check if a row with 'default_code' already exists
		const [existingRow] = await sequelize.query(checkQuery, { raw: true })

		if (existingRow.length > 0) {
			const existingRowId = existingRow[0].id
			console.log(
				`A row with code 'default_code' already exists. Existing row ID: ${existingRowId}. Aborting insertion.`
			)
			return
		}
		// If no existing row, proceed with the insertion
		const [result] = await sequelize.query(insertQuery, { replacements: queryParams, raw: true })
		const insertedRowId = result[0].id
		const [resultCode] = await sequelize.query(insertCodeQuery, {
			replacements: ['default_code', insertedRowId],
			raw: true,
		})

		console.log('Default org ID:', `\x1b[1m\x1b[32m${insertedRowId}\x1b[0m`)
	} catch (error) {
		console.error(`Error creating function: ${error.message}`)
	} finally {
		sequelize.close()
	}
})()
