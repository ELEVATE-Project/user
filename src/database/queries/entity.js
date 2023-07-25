const EntityType = require('../models/index').Entity

module.exports = class UserEntityData {
	static async createEntityType(data) {
		try {
			return await EntityType.create(data, { returning: true })
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	static async findAllEntities(filter) {
		try {
			filter.status = 'ACTIVE'
			return await EntityType.findAll({ where: filter })
		} catch (error) {
			return error
		}
	}

	/* 	static async findAllEntities(filter) {
		try {
			const projection = { value: 1, label: 1, _id: 0 }
			const userEntitiesData = await Entities.find(filter, projection)
			return userEntitiesData
		} catch (error) {
			return error
		}
	} */

	static async updateOneEntity(id, update, options = {}) {
		try {
			const filter = {
				id: id,
			}
			const [rowsAffected] = await EntityType.update(update, {
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

	static async deleteOneEntityType(id) {
		try {
			const rowsAffected = await EntityType.destroy({
				where: {
					id: id,
				},
			})

			return rowsAffected > 0 ? 'ENTITY_UPDATED' : 'ENTITY_NOT_FOUND'
		} catch (error) {
			throw error
		}
	}

	static async findEntityTypeById(filter) {
		try {
			const entityData = await EntityType.findByPk(filter)
			return entityData
		} catch (error) {
			return error
		}
	}
}
