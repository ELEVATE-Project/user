const fs = require('fs-extra')
const path = require('path')

const migrationsDir = require('../env/migrationsDir')

function createMigrationsDirectory() {
	return fs.mkdirs(path.join(process.cwd(), process.env.MIGRATION_DIR))
}

module.exports = async () => {
	await migrationsDir.shouldNotExist()
	return createMigrationsDirectory()
}
