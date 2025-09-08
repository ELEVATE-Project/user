'use strict'

const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const process = require('process')
const basename = path.basename(__filename)
const env = process.env.NODE_ENV || 'development'
// const config = require(__dirname + '/../config/config.js')[env]

const config = require('../../configs/postgres.js')[env]

const db = {}
let sequelize

// --- Custom logger ---
const SLOW_QUERY_THRESHOLD = 200 // ms

function queryLogger(sql, timing) {
	//TODO: remove after getting the data
	if (timing && timing > SLOW_QUERY_THRESHOLD) {
		console.warn(`[SLOW-QUERY:::] ${sql} (${timing} ms)`)
	} else {
		// Uncomment if you want to see all queries (optional)
		console.log(`[SQL:::] ${sql} (${timing} ms)`)
	}
}

// --- Initialize Sequelize ---
if (config.url) {
	sequelize = new Sequelize(config.url, {
		...config,
		logging: queryLogger,
		benchmark: true,
	})
} else {
	sequelize = new Sequelize(config.database, config.username, config.password, {
		...config,
		logging: queryLogger,
		benchmark: true,
	})
}

// --- Load models ---
fs.readdirSync(__dirname)
	.filter((file) => {
		return (
			file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js' && file.indexOf('.test.js') === -1
		)
	})
	.forEach((file) => {
		const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes)
		db[model.name] = model
	})

Object.keys(db).forEach((modelName) => {
	if (db[modelName].associate) {
		db[modelName].associate(db)
	}
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
