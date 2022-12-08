const mongoose = require('mongoose')
const mongoose_autopopulate = require('mongoose-autopopulate')
const mongoose_timestamp = require('mongoose-timestamp')
const { matchers } = require('jest-json-schema')
expect.extend(matchers)
const { logger } = require('@log/logger')

//Connect to database

const db = mongoose.createConnection('mongodb://127.0.0.1:27017/elevate-mentoring', {
	useNewUrlParser: true,
})

db.on('error', function () {
	logger.info('Database connection error:')
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
		logger.info(error)
	}
	mongoose.disconnect()
})
