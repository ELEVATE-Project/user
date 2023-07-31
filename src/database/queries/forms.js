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
		return await database.Form.findOne({
			where: filter,
			raw: true,
		})
	} catch (error) {
		return error
	}
}

exports.updateOneForm = async (filter, update, options = {}) => {
	try {
		const [res] = await database.Form.update(update, {
			where: filter,
			...options,
			individualHooks: true,
		})

		return res
	} catch (error) {
		return error
	}
}

exports.findAllTypeFormVersion = async () => {
	try {
		const formData = await database.Form.findAll({
			attributes: ['id', 'type', 'version'],
			raw: true,
		})
		return formData
	} catch (error) {
		return error
	}
}
