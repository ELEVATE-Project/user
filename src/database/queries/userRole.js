'use strict'
const UserRole = require('@database/models/index').UserRole

const { Op } = require('sequelize')
exports.findOne = async (filter, options = {}) => {
	try {
		return await UserRole.findOne({
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
		return await UserRole.findByPk(id)
	} catch (error) {
		return error
	}
}

exports.findAll = async (filter, options = {}) => {
	try {
		return await UserRole.findAll({
			where: filter,
			...options,
			raw: true,
		})
	} catch (error) {
		return error
	}
}
