const { MongoClient } = require('mongodb')
global.ObjectID = require('mongodb').ObjectID

/* 
Uses MongoDB v4.1.4, which has an OSI Compliant License (GNU Affero General Public License, version 3)
MongoDB v4.1.4 repository: https://github.com/mongodb/mongo/tree/r4.1.4
MongoDB v4.1.4 License: https://github.com/mongodb/mongo/blob/r4.1.4/LICENSE-Community.txt
*/

module.exports = {
	async connect() {
		const [Mongo, Host, PortDBName] = process.env.MONGODB_URL.split(':')
		const [Port, DBName] = PortDBName.split('/')
		const url = Mongo + ':' + Host + ':' + Port
		const databaseName = DBName
		const options = { useUnifiedTopology: true, useNewUrlParser: true }

		if (!url) {
			throw new Error('No `url` defined in config file!')
		}

		if (!databaseName) {
			throw new Error('No database found')
		}

		const client = await MongoClient.connect(url, options)

		const db = client.db(databaseName)
		db.close = client.close
		return db
	},
	async connectToTransferFromDB() {
		const [Mongo, Host, PortDBName] = process.env.MONGODB_URL.split(':')
		const [Port, DBName] = PortDBName.split('/')
		const url = Mongo + ':' + Host + ':' + Port
		const databaseName = process.env.TRANSFER_FROM_DB || DBName
		const options = { useNewUrlParser: true }

		if (!url) {
			throw new Error('No `url` defined in config file!')
		}

		if (!databaseName) {
			throw new Error('No database found')
		}

		const client = await MongoClient.connect(url, options)

		const transferFromDb = client.db(databaseName)
		transferFromDb.close = client.close
		return transferFromDb
	},
}
