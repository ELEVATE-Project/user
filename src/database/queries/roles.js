'use strict'
const database = require('@database/models/index')

const { Op } = require('sequelize')

exports.findOne = async (filter) => {
	try {
		return await database.Role.findOne(filter)
	} catch (error) {
		return error
	}
}

exports.findByPk = async (id) => {
	try {
		return await database.Role.findByPk(id)
	} catch (error) {
		return error
	}
}
