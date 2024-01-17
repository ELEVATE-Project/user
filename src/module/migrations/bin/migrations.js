#! /usr/bin/env node

const program = require('commander')
global._ = require('lodash')
const Table = require('cli-table')
const migrateMongo = require('../lib/migrate')
const pkgjson = require('../../../package.json')

function printMigrated(migrated = []) {
	migrated.forEach((migratedItem) => {
		console.log(`MIGRATED UP: ${migratedItem}`)
	})
}

function handleError(err) {
	console.error(`ERROR: ${err.message}`)
	process.exit(1)
}

function printStatusTable(statusItems) {
	const table = new Table({ head: ['Filename', 'Applied At'] })
	statusItems.forEach((item) => table.push(_.values(item)))
	console.log(table.toString())
}

program.version(pkgjson.version)

program
	.command('initialization')
	.alias('i')
	.description('initialize a new migration project')
	.action(() =>
		migrateMongo
			.init()
			.then(() => console.log('Initialization successful. Please edit the generated file'))
			.catch((err) => handleError(err))
	)

program
	.command('create [description]')
	.alias('c')
	.description('create a new database migration with the provided description')
	.option('-f --file <file>', 'use a custom config file')
	.action((description, options) => {
		global.options = options
		migrateMongo
			.create(description)
			.then((fileName) => console.log(`Created: ${fileName}`))
			.catch((err) => handleError(err))
	})

program
	.command('up')
	.alias('u')
	.description('run all pending database migrations')
	.option('-n --name <name>', 'use a custom config name')
	.action((env, options) => {
		global.alias = env._alias
		if (env.name !== '') {
			global.upgradeOneItem = env.name
		}
		global.options = options
		migrateMongo.database
			.connect()
			.then((db) => migrateMongo.up(db))
			.then((migrated) => {
				printMigrated(migrated)
				process.exit(0)
			})
			.catch((err) => {
				handleError(err)
				printMigrated(err.migrated)
			})
	})

program
	.command('down')
	.alias('d')
	.description('undo the last applied database migration')
	.option('-n --name <name>', 'use a custom config name')
	.action((env, options) => {
		global.alias = env._alias
		if (env.name !== '') {
			global.downgradeOneItem = env.name
		}
		global.options = options
		migrateMongo.database
			.connect()
			.then((db) => migrateMongo.down(db))
			.then((migrated) => {
				migrated.forEach((migratedItem) => {
					console.log(`MIGRATED DOWN: ${migratedItem}`)
				})
				process.exit(0)
			})
			.catch((err) => {
				handleError(err)
			})
	})

program
	.command('status')
	.alias('s')
	.description('print the changelog of the database')
	.option('-f --file <file>', 'use a custom config file')
	.action((env, options) => {
		global.alias = env._alias
		global.options = options
		migrateMongo.database
			.connect()
			.then((db) => migrateMongo.status(db))
			.then((statusItems) => {
				printStatusTable(statusItems)
				process.exit(0)
			})
			.catch((err) => {
				handleError(err)
			})
	})

program.parse(process.argv)

if (_.isEmpty(program.args)) {
	program.outputHelp()
}
