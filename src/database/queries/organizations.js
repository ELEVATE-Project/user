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
		return await database.Organization.findOne({
			where: filter,
			...options,
			raw: true,
		})
	} catch (error) {
		return error
	}
}

exports.update = async (filter, update, options) => {
	try {
		const [res] = await database.Organization.update(update, {
			where: filter,
			...options,
			individualHooks: true,
		})
		return res
	} catch (error) {
		return error
	}
}
