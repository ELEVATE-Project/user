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
		const roles = await UserRole.findAndCountAll({
			where: filter,
			attributes,
			...options,
		})
		return roles
	} catch (error) {
		throw error
	}
}

exports.updateRoleById = async (id, updatedata) => {
	try {
		const [rowsUpdated, [updatedRoles]] = await UserRole.update(updatedata, {
			where: { id },
			returning: true,
		})
		return updatedRoles
	} catch (error) {
		throw error
	}
}

exports.deleteRoleById = async (id) => {
	try {
		const deletedRows = await UserRole.destroy({
			where: { id: id },
			individualHooks: true,
		})
		return deletedRows
	} catch (error) {
		throw error
	}
}
