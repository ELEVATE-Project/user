'use strict'
const database = require('@database/models/index')

const { Op } = require('sequelize')

exports.create = async (data) => {
	try {
		return await database.User.create(data)
	} catch (error) {
		return error
	}
}

exports.findOne = async (filter) => {
	try {
		return await database.User.findOne(filter)
	} catch (error) {
		return error
	}
}

exports.updateUser = async (update, filter, options) => {
	try {
		let data = await database.User.update(update, filter, options)
		return data
	} catch (error) {
		return error
	}
}
