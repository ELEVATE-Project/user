'use strict'
const database = require('@database/models/index')

const { Op } = require('sequelize')
exports.findOne = async (filter) => {
	try {
		return await database.UserRole.findOne(filter)
	} catch (error) {
		return error
	}
}

exports.findByPk = async (id) => {
	try {
		return await database.UserRole.findByPk(id)
	} catch (error) {
		return error
	}
}

exports.findAll = async (filter) => {
	try {
		return await database.UserRole.findAll(filter)
	} catch (error) {
		console.log(error,"error")
		return error
	}
}
