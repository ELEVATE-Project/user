const mongoose = require('mongoose')
const mongoose_autopopulate = require('mongoose-autopopulate')
const mongoose_timestamp = require('mongoose-timestamp')
const { matchers } = require('jest-json-schema')
expect.extend(matchers)

//Connect to database
/* 
Uses MongoDB v4.1.4, which has an OSI Compliant License (GNU Affero General Public License, version 3)
MongoDB v4.1.4 repository: https://github.com/mongodb/mongo/tree/r4.1.4
MongoDB v4.1.4 License: https://github.com/mongodb/mongo/blob/r4.1.4/LICENSE-Community.txt
*/

const db = mongoose.createConnection('mongodb://127.0.0.1:27017/elevate-mentoring', {
	useNewUrlParser: true,
})

db.on('error', function () {
	console.log('Database connection error:')
})

db.once('open', function () {
	//console.log('Connected to DB')
})

mongoose.plugin(mongoose_timestamp, {
	createdAt: 'createdAt',
	updatedAt: 'updatedAt',
})

mongoose.plugin(mongoose_autopopulate)

global.db = db

beforeAll(async () => {})

afterAll(async () => {
	try {
		//console.log('runs afterAll')
		//await db.dropDatabase()
	} catch (error) {
		console.log(error)
	}
	mongoose.disconnect()
})
