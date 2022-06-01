/**
 * name : configs/mongodb
 * author : Aman
 * Date : 07-Oct-2021
 * Description : Mongodb connections configurations
 */

//Dependencies
const mongoose = require('mongoose')
const mongoose_autopopulate = require('mongoose-autopopulate')
const mongoose_timestamp = require('mongoose-timestamp')


module.exports = function () {
	// Added to remove depreciation warnings from logs.

	const db = mongoose.createConnection(process.env.MONGODB_URL, {
		useNewUrlParser: true,
	})

	db.on('error', function () {
		console.log('Database connection error:')
	})

	db.once('open', function () {
		console.log('Connected to DB')
	})

	mongoose.plugin(mongoose_timestamp, {
		createdAt: 'createdAt',
		updatedAt: 'updatedAt',
	})

	mongoose.plugin(mongoose_autopopulate)

	global.db = db
}
