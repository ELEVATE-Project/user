'use strict'
const EntityType = require('@database/models/index').EntityType
const Entity = require('@database/models/index').Entity
const { Op } = require('sequelize')
module.exports = class UserEntityData {
	static async create(data) {
		try {
			return await EntityType.create(data, { returning: true })
		} catch (error) {
			throw error
		}
	}

	static async findOne(filter, options = {}) {
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

	static async findAll(filter, options = {}) {
		try {
			const entityTypeData = await EntityType.findAll({
				where: filter,
				...options,
				raw: true,
			})
			return entityTypeData
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
									created_by: null,
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

	static async updateOne(filter, update, options = {}) {
		try {
			const [rowsAffected] = await EntityType.update(update, {
				where: filter,
				...options,
			})

			return rowsAffected
		} catch (error) {
			throw error
		}
	}

	static async delete(filter) {
		try {
			const rowsAffected = await EntityType.destroy({
				where: filter,
				individualHooks: true,
			})

			return rowsAffected
		} catch (error) {
			throw error
		}
	}

	static async findById(id) {
		try {
			return await EntityType.findByPk(id)
		} catch (error) {
			return error
		}
	}
}
