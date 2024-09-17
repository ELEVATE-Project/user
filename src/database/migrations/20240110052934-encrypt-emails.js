// Migration for encrypting and decrypting emails

'use strict'

const emailEncryption = require('../../utils/emailEncryption')
const { Sequelize } = require('sequelize')

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await processTable(queryInterface, 'organization_user_invites', 'encrypt')
		await processTable(queryInterface, 'users', 'encrypt')
		await processTable(queryInterface, 'users_credentials', 'encrypt')
	},

	down: async (queryInterface, Sequelize) => {
		await processTable(queryInterface, 'organization_user_invites', 'decrypt')
		await processTable(queryInterface, 'users', 'decrypt')
		await processTable(queryInterface, 'users_credentials', 'decrypt')
	},
}

const processTable = async (queryInterface, tableName, operation) => {
	const greenColor = '\x1b[32m'
	const yellowColor = '\x1b[33m'
	const resetColor = '\x1b[0m'
	const redColor = '\x1b[31m'

	const records = await queryInterface.sequelize.query(`SELECT * FROM ${tableName};`, {
		type: Sequelize.QueryTypes.SELECT,
	})

	const updates = records.map(async (record) => {
		const isEmailValid = validateEmail(record.email)

		if (operation === 'encrypt') {
			if (isEmailValid) {
				const encryptedEmail = emailEncryption.encrypt(record.email)
				if (tableName === 'users_credentials') {
					const t = await queryInterface.sequelize.transaction()
					try {
						const existingRow = await queryInterface.sequelize.query(
							`SELECT * FROM ${tableName} WHERE id = ${record.id};`,
							{
								type: Sequelize.QueryTypes.SELECT,
								transaction: t,
							}
						)
						await queryInterface.sequelize.query(`DELETE FROM ${tableName} WHERE id = ${record.id};`, {
							transaction: t,
						})
						const modifiedRow = { ...existingRow[0], email: encryptedEmail }
						await queryInterface.bulkInsert(tableName, [modifiedRow], { transaction: t })
						await t.commit()
					} catch (error) {
						console.log('ENCRYPTION ERROR: ', error)
						await t.rollback()
					}
				} else
					await queryInterface.sequelize.query(
						`UPDATE ${tableName} SET email = '${encryptedEmail}' WHERE id = ${record.id};`
					)
			} else {
				console.warn(
					`${redColor}Skipping encryption of invalid email in ${yellowColor}${tableName}${resetColor} table with id ${yellowColor}${record.id}${resetColor}: ${yellowColor}${record.email}${resetColor}`
				)
			}
		} else if (operation === 'decrypt') {
			if (!isEmailValid) {
				try {
					const decryptedEmail = emailEncryption.decrypt(record.email)
					const isDecryptedEmailValid = validateEmail(decryptedEmail)
					if (isDecryptedEmailValid) {
						if (tableName === 'users_credentials') {
							const t = await queryInterface.sequelize.transaction()
							try {
								const existingRow = await queryInterface.sequelize.query(
									`SELECT * FROM ${tableName} WHERE id = ${record.id};`,
									{
										type: Sequelize.QueryTypes.SELECT,
										transaction: t,
									}
								)
								await queryInterface.sequelize.query(
									`DELETE FROM ${tableName} WHERE id = ${record.id};`,
									{
										transaction: t,
									}
								)
								const modifiedRow = { ...existingRow[0], email: decryptedEmail }
								await queryInterface.bulkInsert(tableName, [modifiedRow], { transaction: t })
								await t.commit()
							} catch (error) {
								console.log('DECRYPTION ERROR: ', error)
								await t.rollback()
							}
						} else
							await queryInterface.sequelize.query(
								`UPDATE ${tableName} SET email = '${decryptedEmail}' WHERE id = ${record.id};`
							)
					} else {
						console.warn(
							`${redColor}Skipping decryption of email in ${yellowColor}${tableName}${resetColor} table with id ${yellowColor}${record.id}${resetColor} because decrypted emailId wasn't a valid emailId.${resetColor}`
						)
					}
				} catch (error) {
					console.log('Something went wrong: ', error)
					console.log('EMAIL: ', record.email)
				}
			} else {
				console.warn(
					`${redColor}Skipping decryption of email in ${yellowColor}${tableName}${resetColor} table with id ${yellowColor}${record.id}${resetColor} because current emailId is in valid emailId format.${resetColor}`
				)
			}
		}
	})

	await Promise.all(updates)
	console.log(
		`${greenColor}Finished processing ${resetColor}${yellowColor}${tableName}${resetColor} ${greenColor}table.${resetColor}\n`
	)
}

const validateEmail = (email) => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return emailRegex.test(email)
}
