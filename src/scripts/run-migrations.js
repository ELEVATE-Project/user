const Umzug = require('umzug')
const path = require('path')
const { sequelize } = require('../database/models/index') // adjust path if needed

async function runMigrations() {
	const umzug = new Umzug({
		storage: 'sequelize',
		storageOptions: {
			sequelize,
		},
		migrations: {
			path: path.join(__dirname, '../database/migrations'),
			pattern: /\.js$/,
			params: [sequelize.getQueryInterface(), sequelize.constructor],
		},
		logging: console.log,
	})

	try {
		console.log('Starting migrations...')
		await umzug.up()
		console.log('MIGRATION_SUCCESS')
		process.exit(0)
	} catch (err) {
		console.error('Migration failed:', err)
		process.exit(1)
	}
}

runMigrations()
