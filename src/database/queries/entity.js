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
			filter.status = 'ACTIVE'
			return await Entity.findAll({ where: filter })
		} catch (error) {
			throw error
		}
	}

	static async updateOneEntity(id, update, options = {}) {
		try {
			const filter = {
				id: id,
			}
			const [rowsAffected] = await Entity.update(update, {
				where: filter,
				...options,
			})

			if (rowsAffected > 0) {
				return 'ENTITY_UPDATED'
			} else {
				return 'ENTITY_NOT_FOUND'
			}
		} catch (error) {
			throw error
		}
	}

	static async deleteOneEntityType(id, userId) {
		try {
			const rowsAffected = await Entity.destroy({
				where: {
					id: id,
					created_by: userId,
				},
			})

			return rowsAffected > 0 ? 'ENTITY_UPDATED' : 'ENTITY_NOT_FOUND'
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
