'use strict'
// const database = require('@database/models/index')
const database = require('../../database/models/index')
const { Op } = require('sequelize')

const { elevateLog } = require('elevate-logger')
const logger = elevateLog.init()

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

exports.updateOneUser = async (update, filter, options) => {
	try {
		let data = await database.User.update(update, filter, options)
		logger.info('updatedeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')
		return data
	} catch (error) {
		logger.info('err-----------------' + error)
		return error
	}
}
