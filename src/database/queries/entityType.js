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

	static async findAllEntityTypes(filter, attributes) {
		try {
			const entityData = await EntityType.findAll({
				where: filter,
				attributes,
			})
			return entityData
		} catch (error) {
			return error
		}
	}
	static async findUserEntityTypesAndEntities(filter, userId) {
		try {
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
			return await EntityType.update(update, {
				where: {
					id: id,
				},
				...options,
			})
		} catch (error) {
			throw error
		}
	}

	static async deleteOneEntityType(id) {
		try {
			return await EntityType.destroy({
				where: {
					id: id,
				},
				individualHooks: true,
			})
		} catch (error) {
			throw error
		}
	}

	static async findEntityTypeById(filter) {
		try {
			return await EntityType.findByPk(filter)
		} catch (error) {
			return error
		}
	}
}
