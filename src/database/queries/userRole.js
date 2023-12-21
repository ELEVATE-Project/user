'use strict'
const UserRole = require('@database/models/index').UserRole

const { Op } = require('sequelize')

exports.create = async (data) => {
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
