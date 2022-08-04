const _ = require('lodash')
const pEachSeries = require('p-each-series')
const fnArgs = require('fn-args')
const { promisify } = require('util')
const status = require('./status')
const migrationsDir = require('../env/migrationsDir')
const database = require('../env/database')

module.exports = async (db) => {
	const statusItems = await status(db)
	const pendingItems = _.filter(statusItems, { appliedAt: 'PENDING' })
	const migrated = []

	global.transferFromDb = await database.connectToTransferFromDB()

	const migrateItem = async (item) => {
		try {
			const migration = await migrationsDir.loadMigration(item.fileName)
			const args = fnArgs(migration.up)
			const up = args.length > 1 ? promisify(migration.up) : migration.up
			await up(db)
		} catch (err) {
			const error = new Error(`Could not migrate upgrade ${item.fileName}: ${err.message}`)
			error.migrated = migrated
			throw error
		}

		const collectionName = process.env.MIGRATION_COLLECTION || 'migrations'
		const collection = db.collection(collectionName)

		const { fileName } = item
		const appliedAt = new Date()
		const message = global.migrationMsg

		try {
			await collection.insertOne({ fileName, appliedAt, message })
		} catch (err) {
			throw new Error(`Could not update changelog: ${err.message}`)
		}
		migrated.push(item.fileName)
	}

	await pEachSeries(pendingItems, migrateItem)
	return migrated
}
