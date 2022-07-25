const fs = require('fs-extra')
const path = require('path')

const DEFAULT_MIGRATIONS_DIR_NAME = 'migrations'

async function resolveMigrationsDirPath() {
	let migrationsDir
	try {
		migrationsDir = process.env.MIGRATION_DIR

		if (!migrationsDir) {
			migrationsDir = DEFAULT_MIGRATIONS_DIR_NAME
		}
	} catch (err) {
		migrationsDir = DEFAULT_MIGRATIONS_DIR_NAME
	}

	if (path.isAbsolute(migrationsDir)) {
		return migrationsDir
	}
	return path.join(process.cwd(), migrationsDir)
}

module.exports = {
	resolve: resolveMigrationsDirPath,

	async shouldExist() {
		const migrationsDir = await resolveMigrationsDirPath()
		try {
			await fs.stat(migrationsDir)
		} catch (err) {
			throw new Error(`migrations directory does not exist: ${migrationsDir}`)
		}
	},

	async shouldNotExist() {
		const migrationsDir = await resolveMigrationsDirPath()
		const error = new Error(`migrations directory already exists: ${migrationsDir}`)

		try {
			await fs.stat(migrationsDir)
			throw error
		} catch (err) {
			if (err.code !== 'ENOENT') {
				throw error
			}
		}
	},

	async getFileNames() {
		const migrationsDir = await resolveMigrationsDirPath()
		const files = await fs.readdir(migrationsDir)
		return files.filter((file) => path.extname(file) === '.js')
	},

	async loadMigration(fileName) {
		const migrationsDir = await resolveMigrationsDirPath()
		return require(path.join(migrationsDir, fileName)) // eslint-disable-line
	},
}
