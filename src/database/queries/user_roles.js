'use strict'
const database = require('@database/models/index')

const { Op } = require('sequelize')
exports.findOne = async (filter, options = {}) => {
	try {
		return await database.UserRole.findOne({
			where: filter,
			...options,
			raw: true,
		})
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

exports.findAll = async (filter, options = {}) => {
	try {
		return await database.UserRole.findAll({
			where: filter,
			...options,
			raw: true,
		})
	} catch (error) {
		return error
	}
}
