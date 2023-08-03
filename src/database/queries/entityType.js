const EntityType = require('../models/index').EntityType
const Entity = require('../models/index').Entity
const { Op } = require('sequelize')

module.exports = class UserEntityData {
	static async createEntityType(data) {
		try {
			return await EntityType.create(data, { returning: true })
		} catch (error) {
			throw error
		}
	}

	static async findOneEntityType(filter) {
		try {
			return await EntityType.findOne({ where: filter })
		} catch (error) {
			throw error
		}
	}

	static async findAllEntityTypes(filter) {
		try {
			const attributes = ['value', 'label', 'id']
			const entityData = await EntityType.findAll({
				where: filter,
				attributes,
			})
			return entityData
		} catch (error) {
			return error
		}
	}
	static async findAllUserEntityTypes(filter, userId) {
		try {
			filter.status = 'ACTIVE'
			return await EntityType.findAll({
				where: filter,
				include: [
					{
						model: Entity,
						required: false,
						where: {
							[Op.or]: [
								{
									created_by: 0,
								},
								{
									created_by: userId,
								},
							],
						},
						as: 'entities',
					},
				],
			})
		} catch (error) {
			return error
		}
	}

	static async updateOneEntityType(id, update, options = {}) {
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
				individualHooks: true,
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
