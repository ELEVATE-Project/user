const { MongoClient } = require('mongodb')
const crypto = require('crypto')

require('dotenv').config({ path: './.env' })
const [Mongo, Host, PortDBName] = process.env.MONGODB_URL.split(':')
const [Port, DBName] = PortDBName.split('/')
const url = Mongo + ':' + Host + ':' + Port
const databaseName = DBName
var validator = require('email-validator')
const client = new MongoClient(url)

const algorithm = 'aes-256-cbc'
let key = Buffer.from(process.env.KEY, 'base64')
let iv = Buffer.from(process.env.IV, 'base64')

// Encrypting text
function encrypt(text) {
	let cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'base64'), iv)
	let encrypted = cipher.update(text)
	encrypted = Buffer.concat([encrypted, cipher.final()])
	return encrypted.toString('base64')
}

async function getValidPlainEmail() {
	try {
		let database = client.db(databaseName)
		let users = database.collection('users')
		const options = {
			sort: { name: 1 },
			projection: { _id: 1, email: 1, name: 1 },
		}
		const cursor = await users.find({}, options)

		const validPlainEmail = []
		await cursor.forEach((element) => {
			if (validator.validate(element.email.address)) {
				validPlainEmail.push(element)
			}
		})
		return validPlainEmail
	} catch (errr) {
		console.log(errr)
	} finally {
		await client.close()
	}
}

async function updateEmail(validPlainEmail) {
	try {
		await client.connect()
		let database = client.db(databaseName)
		let users = database.collection('users')
		let validEncryptedEmail = []
		validPlainEmail.forEach((element) => {
			let encryptedEmail = encrypt(element.email.address)
			element.email.address = encryptedEmail
			let updateObject = {
				updateOne: {
					filter: { _id: element._id },
					update: { $set: { email: element.email } },
				},
			}
			validEncryptedEmail.push(updateObject)
		})
		const result = await users.bulkWrite(validEncryptedEmail)
		console.log(result)
	} catch (error) {
		console.log(error)
	} finally {
		client.close()
	}
}

async function main() {
	const data = await getValidPlainEmail()
	if (data.length >= 1) {
		console.log('Updating Data')
		updateEmail(data)
	} else {
		console.log('Nothing to update')
	}
}

main()
