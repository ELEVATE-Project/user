const { Sequelize } = require('sequelize')
require('dotenv').config({ path: '../../.env' })

// Environment setup
const nodeEnv = process.env.NODE_ENV || 'development'

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
	try {
		const allowed_tenants = ['shikshagraha', 'shikshalokam', 'default']
		console.info('ALLOWED TENANTS: ', allowed_tenants)

		const USER_ROLE_FETCH_QUERY = `SELECT id , title  FROM user_roles WHERE tenant_code IN (:allowedTenants) AND title ILIKE '% %'`

		console.log('USER_ROLE_FETCH_QUERY : ', USER_ROLE_FETCH_QUERY)

		// Test database connection
		await sequelize.authenticate()
		console.log('Database connection established successfully.')

		// Execute the query with replacements
		const fetchUserRoles = await sequelize.query(USER_ROLE_FETCH_QUERY, {
			replacements: { allowedTenants: allowed_tenants },
			type: Sequelize.QueryTypes.SELECT,
			raw: true,
		})
		const updateQueries = fetchUserRoles.map((roles) => {
			return `UPDATE user_roles SET title = '${roles.title.replace(/\s+/g, '_')}' WHERE id = ${roles.id};`
		})

		console.log('UPDATE QUERY : ', updateQueries)

		const updateQueryPromises = updateQueries.map((query) => {
			return sequelize.query(query, {
				type: Sequelize.QueryTypes.UPDATE,
			})
		})

		const result = await Promise.allSettled(updateQueryPromises)
		console.log('RESULT : ', result)
	} catch (error) {
		console.error(`Error creating function: ${error}`)
	} finally {
		sequelize.close()
	}
})()
