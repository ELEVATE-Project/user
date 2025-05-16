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
    INSERT INTO organizations (name, code, description, status, updated_at, created_at , tenant_code)
    VALUES (?, ?, ?, ?, NOW(), NOW(), '${process.env.DEFAULT_TENANT_ORG_CODE}')
    RETURNING id;
`

// Raw sql query to fetch data from features table
const fetchFeaturesQuery = `
	SELECT * FROM features;
`
// Raw SQL query to insert data into organization_features table
const insertOrgFeatureQuery = `
	INSERT INTO organization_features (
		organization_code,
		feature_code,
		enabled,
		feature_name,
		icon,
		tenant_code,
		created_at,
		updated_at
	) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW());
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

		console.log('Default org ID:', `\x1b[1m\x1b[32m${insertedRowId}\x1b[0m`)

		// insert data into organization_features table after fetching the data from the features table
		// data in feature will get generated when the migrations are run during the  startup

		const [features] = await sequelize.query(fetchFeaturesQuery, { raw: true })

		//for each feature, insert a row into the organization_features table
		for (const feature of features) {
			const values = [
				process.env.DEFAULT_TENANT_ORG_CODE, // organization_code
				feature.code, // feature_code
				true, // enabled
				feature.label, // feature_name
				feature.icon, // icon (can be null)
				process.env.DEFAULT_TENANT_CODE, // tenant_code
			]

			await sequelize.query(insertOrgFeatureQuery, {
				replacements: values,
				raw: true,
			})

			console.log(`Inserted feature: ${feature.code}`)
		}
	} catch (error) {
		console.error(`Error creating function: ${error.message}`)
	} finally {
		sequelize.close()
	}
})()
