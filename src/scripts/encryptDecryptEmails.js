'use strict'
const { Sequelize } = require('sequelize')
require('dotenv').config({ path: '../.env' })
const emailEncryption = require('../utils/emailEncryption')

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

const processTable = async (tableName, operation) => {
	const records = await sequelize.query(`SELECT * FROM ${tableName};`, {
		type: Sequelize.QueryTypes.SELECT,
	})

	for (const record of records) {
		const columnValue =
			operation === 'encrypt' ? emailEncryption.encrypt(record.email) : emailEncryption.decrypt(record.email)
		await sequelize.query(`UPDATE ${tableName} SET email = '${columnValue}' WHERE id = ${record.id};`)
	}

	console.log(`Finished processing ${tableName} table.`)
}

const main = async () => {
	const operation = process.argv[2]

	if (operation !== 'encrypt' && operation !== 'decrypt') {
		console.error('Invalid operation. Please use "encrypt" or "decrypt".')
		process.exit(1)
	}

	try {
		await processTable('organization_user_invites', operation)
		await processTable('users', operation)
		await processTable('users_credentials', operation)
	} catch (err) {
		console.error(err)
		process.exit(1)
	}

	console.log('Script completed successfully.')
	process.exit(0)
}

main()
