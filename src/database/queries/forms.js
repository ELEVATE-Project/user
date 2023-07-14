'use strict'
const database = require('../models/index')
const { Op } = require('sequelize')

exports.create = async (data) => {
	try {
		return await database.Form.create(data)
	} catch (error) {
		return error
	}
}

exports.findOne = async (filter) => {
	try {
		return await database.Form.findOne(filter)
	} catch (error) {
		return error
	}
}

exports.updateOneForm = async (update, filter, options) => {
	try {
		let data = await database.Form.update(update, filter, options)
		return data
	} catch (error) {
		return error
	}
}

exports.findAllTypeFormVersion = async () => {
	try {
		const formData = await database.Form.findAll({
			attributes: ['id', 'type'],
		})
		return formData
	} catch (error) {
		return error
	}
}
