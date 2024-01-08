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

/* 
Uses MongoDB v4.1.4, which has an OSI Compliant License (GNU Affero General Public License, version 3)
MongoDB v4.1.4 repository: https://github.com/mongodb/mongo/tree/r4.1.4
MongoDB v4.1.4 License: https://github.com/mongodb/mongo/blob/r4.1.4/LICENSE-Community.txt
*/

const { elevateLog } = require('elevate-logger')
const logger = elevateLog.init()

module.exports = function () {
	// Added to remove depreciation warnings from logs.

	let parameters = ''
	if (process.env.REPLICA_SET_NAME) {
		parameters = '?replicaSet=' + process.env.REPLICA_SET_NAME
	}
	if (process.env.REPLICA_SET_NAME && process.env.REPLICA_SET_READ_PREFERENCE) {
		parameters = parameters + '&readPreference=' + process.env.REPLICA_SET_READ_PREFERENCE
	}

	let db
	if (!parameters) {
		db = mongoose.createConnection(process.env.MONGODB_URL, {
			useNewUrlParser: true,
		})
	} else {
		db = mongoose.createConnection(process.env.MONGODB_URL + parameters, {
			useNewUrlParser: true,
		})
	}

	db.on('error', function () {
		logger.error('Database connection error:', {
			triggerNotification: true,
		})
	})

	db.once('open', function () {
		logger.info('Connected to DB')
	})

	mongoose.plugin(mongoose_timestamp, {
		createdAt: 'createdAt',
		updatedAt: 'updatedAt',
	})

	mongoose.plugin(mongoose_autopopulate)

	global.db = db
}
