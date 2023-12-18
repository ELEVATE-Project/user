'use strict'
const UserRole = require('@database/models/index').UserRole

const { Op } = require('sequelize')
module.exports = class UserRoleModulesData {
	static async findOne(filter, options = {}) {
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

	static async create(data) {
		try {
			return await UserRole.create(data, { returning: true })
		} catch (error) {
			throw error
		}
	}

	static async findRoleById(id) {
		try {
			return await UserRole.findByPk(id)
		} catch (error) {
			throw error
		}
	}

	static async findAllRoles(filter, attributes, options) {
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

	static async updateRoleById(id, updatedata) {
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

	static async deleteRoleById(id) {
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

	static async findRoleId(filter) {
		try {
			const roleData = await UserRole.findByPk(filter)
			return roleData
		} catch (error) {
			return error
		}
	}

	static async getcolumn() {
		try {
			return await Object.keys(UserRole.rawAttributes)
		} catch (error) {
			return error
		}
	}
}
