const mongoose = require('mongoose')
const mongoose_autopopulate = require('mongoose-autopopulate')
const mongoose_timestamp = require('mongoose-timestamp')
const { matchers } = require('jest-json-schema')
expect.extend(matchers)

//Connect to database

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
		//await db.dropDatabase()
		await db.close()
		mongoose.disconnect()
	} catch (error) {
		console.log(error)
	}
	//mongoose.disconnect()
})
