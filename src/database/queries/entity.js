const Entity = require('../models/index').Entity
module.exports = class UserEntityData {
	static async createEntity(data) {
		try {
			return await Entity.create(data, { returning: true })
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	static async findAllEntities(filter) {
		try {
			return await Entity.findAll({ where: filter })
		} catch (error) {
			throw error
		}
	}

	static async updateOneEntity(id, update, userId, options = {}) {
		try {
			return await Entity.update(update, {
				where: {
					id: id,
					created_by: userId,
				},
				...options,
			})
		} catch (error) {
			throw error
		}
	}

	static async deleteOneEntityType(id, userId) {
		try {
			return await Entity.destroy({
				where: {
					id: id,
					created_by: userId,
				},
			})
		} catch (error) {
			throw error
		}
	}

	static async findEntityTypeById(filter) {
		try {
			const entityData = await Entity.findByPk(filter)
			return entityData
		} catch (error) {
			return error
		}
	}
}
