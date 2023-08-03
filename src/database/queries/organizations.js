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

exports.updateOrg = async (update, filter, options) => {
	try {
		const res = await database.Organization.update(update, filter, options)
		return res
	} catch (error) {
		return error
	}
}
