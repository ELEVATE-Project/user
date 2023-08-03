'use strict'
const database = require('@database/models/index')
const { Op } = require('sequelize')

exports.create = async (data) => {
	try {
		return await database.EntityType.create(data)
	} catch (err) {
		console.log(err)
	}
}

exports.findOne = async (filter, options = {}) => {
	try {
		return await database.EntityType.findOne({
			where: filter,
			...options,
			raw: true,
		})
	} catch (error) {
		return error
	}
}
