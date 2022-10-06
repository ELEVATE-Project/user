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
// Decrypting text
function decrypt(text) {
	let encryptedText = Buffer.from(text, 'base64')
	let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv)
	let decrypted = decipher.update(encryptedText)
	decrypted = Buffer.concat([decrypted, decipher.final()])
	return decrypted.toString()
}

async function getValidEncryptedEmails() {
	try {
		let database = client.db(databaseName)
		let users = database.collection('users')
		const options = {
			sort: { name: 1 },
			projection: { _id: 1, email: 1, name: 1 },
		}
		const cursor = await users.find({}, options)

		const validEncryptedEmail = []
		await cursor.forEach((element) => {
			if (validator.validate(element.email.address)) {
			} else {
				validEncryptedEmail.push(element)
			}
		})
		return validEncryptedEmail
	} catch (errr) {
		console.log(errr)
	} finally {
		await client.close()
	}
}

async function updateEmail(validEncryptedEmail) {
	try {
		await client.connect()
		let database = client.db(databaseName)
		let users = database.collection('users')
		let validPlainEmail = []
		validEncryptedEmail.forEach((element) => {
			let decryptedEmail = decrypt(element.email.address)
			element.email.address = decryptedEmail
			let updateObject = {
				updateOne: {
					filter: { _id: element._id },
					update: { $set: { email: element.email } },
				},
			}

			validPlainEmail.push(updateObject)
		})
		const result = await users.bulkWrite(validPlainEmail)
		console.log(result)
	} catch (error) {
		console.log(error)
	} finally {
		client.close()
	}
}

async function main() {
	const data = await getValidEncryptedEmails()
	console.log(data)
	if (data.length >= 1) {
		console.log('Updating Data')
		updateEmail(data)
	} else {
		console.log('Nothing to update')
	}
}
main()
