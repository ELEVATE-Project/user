'use strict'
const UserCredential = require('@database/models/index').UserCredential

exports.create = async (data) => {
	try {
		const res = await UserCredential.create(data)
		return res.get({ plain: true })
	} catch (error) {
		console.log(error)
		return error
	}
}

exports.findOne = async (filter, options = {}) => {
	try {
		return await UserCredential.findOne({
			where: filter,
			...options,
			raw: true,
		})
	} catch (error) {
		return error
	}
}

exports.updateUser = async (filter, update, options = {}) => {
	try {
		return await UserCredential.update(update, {
			where: filter,
			...options,
			individualHooks: true,
		})
	} catch (error) {
		return error
	}
}

exports.findAll = async (filter, options = {}) => {
	try {
		return await UserCredential.findAll({
			where: filter,
			...options,
			raw: true,
		})
	} catch (error) {
		return error
	}
}
