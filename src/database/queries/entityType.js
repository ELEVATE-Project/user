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

	static async findOneEntityType(filter, options = {}) {
		try {
			return await EntityType.findOne({
				where: filter,
				...options,
				raw: true,
			})
		} catch (error) {
			throw error
		}
	}

	static async findAllEntityTypes(orgId, attributes) {
		try {
			const entityData = await EntityType.findAll({
				where: {
					[Op.or]: [
						{
							created_by: 0,
						},
						{
							org_id: orgId,
						},
					],
				},
				attributes,
				raw: true,
			})
			return entityData
		} catch (error) {
			return error
		}
	}
	static async findUserEntityTypesAndEntities(filter) {
		try {
			return await EntityType.findAll({
				where: filter,
				include: [
					{
						model: Entity,
						required: false,
						where: {
							status: 'ACTIVE',
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
