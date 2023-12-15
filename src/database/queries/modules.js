const Modules = require('@database/models/index').Module
const { Op } = require('sequelize')

module.exports = class UserRoleModulesData {
	static async createModules(data) {
		try {
			return await Modules.create(data, { returning: true })
		} catch (error) {
			throw error
		}
	}

	static async findModulesById(id) {
		try {
			return await Modules.findByPk(id)
		} catch (error) {
			throw error
		}
	}

	static async findAllModules(filter, attributes, options) {
		try {
			const permissions = await Modules.findAndCountAll({
				where: filter,
				attributes,
				options,
			})
			return permissions
		} catch (error) {
			throw error
		}
	}

	static async updateModules(filter, updatedata) {
		try {
			const [rowsUpdated, [updatedModules]] = await Modules.update(updatedata, {
				where: filter,
				returning: true,
			})
			return updatedModules
		} catch (error) {
			throw error
		}
	}

	static async deleteModulesById(id) {
		try {
			const deletedRows = await Modules.destroy({
				where: { id: id },
				individualHooks: true,
			})
			return deletedRows
		} catch (error) {
			throw error
		}
	}
}
