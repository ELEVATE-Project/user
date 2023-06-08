'use strict'

const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const process = require('process')
const basename = path.basename(__filename)
const env = process.env.NODE_ENV || 'development'
const config = require(__dirname + '/../config/config.js')[env]
const dbPsql = {}
let sequelize;

if (config.url) {
	sequelize = new Sequelize(config.url, config)
} else {
	sequelize = new Sequelize(config.database, config.username, config.password, config)
}

fs.readdirSync(__dirname)
	.filter((file) => {
		return (
			file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js' && file.indexOf('.test.js') === -1
		)
	})
	.forEach((file) => {
		const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes)
		dbPsql[model.name] = model
	})

Object.keys(dbPsql).forEach((modelName) => {

	if (dbPsql[modelName].associate) {
		dbPsql[modelName].associate(dbPsql)
	}

	dbPsql.modelName = require('./'+modelName);
})

sequelize.sync()

dbPsql.sequelize = sequelize
dbPsql.Sequelize = Sequelize


module.exports = dbPsql

