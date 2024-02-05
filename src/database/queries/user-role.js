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
		return await UserRole.findByPk(id, { raw: true })
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

exports.create = async (data, user_organization_id) => {
	try {
		return await UserRole.create(data, { returning: true })
	} catch (error) {
		throw error
	}
}

exports.findRoleById = async (id) => {
	try {
		return await UserRole.findByPk(id)
	} catch (error) {
		throw error
	}
}

exports.findAllRoles = async (filter, attributes, options) => {
	try {
		return await UserRole.findAndCountAll({
			where: filter,
			attributes,
			...options,
			raw: true,
		})
	} catch (error) {
		throw error
	}
}

exports.updateRole = async (filter, updatedata) => {
	try {
		return await UserRole.update(updatedata, {
			where: filter,
			returning: true,
		})
	} catch (error) {
		throw error
	}
}

exports.deleteRole = async (filter) => {
	try {
		return await UserRole.destroy({
			where: filter,
			individualHooks: true,
		})
	} catch (error) {
		throw error
	}
}
