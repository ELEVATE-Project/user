'use strict'
const Form = require('../models/index').Form

exports.create = async (data) => {
	try {
		return await Form.create(data)
	} catch (error) {
		return error
	}
}

exports.findOne = async (filter, options = {}) => {
	try {
		return await Form.findOne({
			where: filter,
			...options,
			raw: true,
		})
	} catch (error) {
		return error
	}
}

exports.updateOneForm = async (filter, update, options = {}) => {
	try {
		const [res] = await Form.update(update, {
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
		const formData = await Form.findAll({
			attributes: ['id', 'type', 'version'],
			raw: true,
		})
		return formData
	} catch (error) {
		return error
	}
}
