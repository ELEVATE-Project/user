require('module-alias/register')
require('dotenv').config()

let environmentData = require('../envVariables')()

if (!environmentData.success) {
	console.error('Server could not start . Not all environment variable is provided', {
		triggerNotification: true,
	})
	process.exit()
}
module.exports = {
	development: {
		url: process.env.DEV_DATABASE_URL,
		dialect: 'postgres',
		migrationStorageTableName: 'sequelize_meta',
		define: {
			underscored: true,
			freezeTableName: true,
			paranoid: true,
			syncOnAssociation: true,
			charset: 'utf8',
			collate: 'utf8_general_ci',
			timestamps: true,
			createdAt: 'created_at',
			updatedAt: 'updated_at',
			deletedAt: 'deleted_at',
		},
		pool: {
			max: parseInt(process.env.DB_POOL_MAX),
			min: parseInt(process.env.DB_POOL_MIN),
			acquire: parseInt(process.env.DB_POOL_ACQUIRE_MS),
			idle: parseInt(process.env.DB_POOL_IDLE_MS),
			evict: parseInt(process.env.DB_POOL_EVICT_MS),
		},
		dialectOptions: {
			application_name: process.env.APP_NAME,
			keepAlive: true,
			statement_timeout: parseInt(process.env.PG_STATEMENT_TIMEOUT_MS),
			idle_in_transaction_session_timeout: parseInt(process.env.PG_IDLE_TX_TIMEOUT_MS),
		},
		//logging: false,
		defaultOrgId: parseInt(process.env.DEFAULT_ORG_ID),
	},
	test: {
		url: process.env.TEST_DATABASE_URL,
		dialect: 'postgres',
		defaultOrgId: parseInt(process.env.DEFAULT_ORG_ID),
	},
	production: {
		url: process.env.DATABASE_URL,
		dialect: 'postgres',
		pool: {
			max: parseInt(process.env.DB_POOL_MAX),
			min: parseInt(process.env.DB_POOL_MIN),
			acquire: parseInt(process.env.DB_POOL_ACQUIRE_MS),
			idle: parseInt(process.env.DB_POOL_IDLE_MS),
			evict: parseInt(process.env.DB_POOL_EVICT_MS),
		},
		dialectOptions: {
			application_name: process.env.APP_NAME,
			keepAlive: true,
			statement_timeout: parseInt(process.env.PG_STATEMENT_TIMEOUT_MS),
			idle_in_transaction_session_timeout: parseInt(process.env.PG_IDLE_TX_TIMEOUT_MS),
		},
		defaultOrgId: parseInt(process.env.DEFAULT_ORG_ID),
	},
}
