'use strict'
const database = require('@database/models/index')
const { Op } = require('sequelize')

exports.create = async (data) => {
	try {
		return await database.notification_templates.create(data)
	} catch (err) {
		console.log(err)
	}
}
