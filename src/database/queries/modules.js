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

	static async findAllModules(page, limit, search) {
		try {
			const offset = (page - 1) * limit

			const whereCondition = {
				code: { [Op.iLike]: `%${search}%` },
			}

			const options = {
				where: whereCondition,
				offset,
				limit,
				attributes: ['id', 'code', 'status'],
			}

			const permissions = await Modules.findAndCountAll(options)
			return permissions
		} catch (error) {
			throw error
		}
	}

	static async updateModulesById(id, updatedata) {
		try {
			const [rowsUpdated, [updatedModules]] = await Modules.update(updatedata, {
				where: { id },
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

	static async findModulesId(filter) {
		try {
			const ModulesData = await Modules.findByPk(filter)
			return ModulesData
		} catch (error) {
			return error
		}
	}
}
