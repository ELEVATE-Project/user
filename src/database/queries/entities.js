const Entity = require('@database/models/index').Entity
const common = require('@constants/common')
module.exports = class UserEntityData {
	static async create(data) {
		try {
			return await Entity.create(data, { returning: true })
		} catch (error) {
			throw error
		}
	}

	static async findAll(filter, options = {}) {
		try {
			filter.status = common.activeStatus
			return await Entity.findAll({
				where: filter,
				...options,
				raw: true,
			})
		} catch (error) {
			throw error
		}
	}

	static async updateOne(filter, update, options = {}) {
		try {
			const [rowsAffected] = await Entity.update(update, {
				where: filter,
				...options,
			})

			return rowsAffected
		} catch (error) {
			throw error
		}
	}

	static async delete(id, userId) {
		try {
			const rowsAffected = await Entity.destroy({
				where: {
					id: id,
					created_by: userId,
				},
			})

			return rowsAffected
		} catch (error) {
			throw error
		}
	}

	static async findById(id) {
		try {
			const entityData = await Entity.findByPk(id)
			return entityData
		} catch (error) {
			return error
		}
	}

	static async findOne(filter, options = {}) {
		try {
			return await Entity.findOne({
				where: filter,
				...options,
				raw: true,
			})
		} catch (error) {
			return error
		}
	}
}
