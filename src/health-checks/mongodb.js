/**
 * name : mongodb.js.
 * author : Aman Karki.
 * created-date : 17--2021.
 * Description : Mongodb health check.
 */

// Dependencies
const mongoose = require('mongoose')

function health_check() {
	const db = mongoose.createConnection(process.env.MONGODB_URL)
	db.on('error', function () {
		return false
	})

	db.once('open', function () {
		db.close(function () {})
		return true
	})
}

module.exports = {
	health_check: health_check,
}
