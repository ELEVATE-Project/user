'use strict'
const database = require('@database/models/index')
const { Op } = require('sequelize')

exports.create = async (data) => {
	try {
		return await database.Organization.create(data)
	} catch (error) {
		return error
	}
}

exports.findOne = async (filter, options) => {
	try {
		return await database.Organization.findOne(filter, options)
	} catch (error) {
		return error
	}
}

exports.findByPk = async (id) => {
	try {
		return await database.Organization.findByPk(id)
	} catch (error) {
		return error
	}
}
