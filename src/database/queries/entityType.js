const EntityType = require('../models/index').EntityType
const Entity = require('../models/index').Entity
const { Op } = require('sequelize')
const Sequelize = require('@database/models/index').sequelize

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

	static async findAllEntityTypes(orgId, attributes, filter = {}) {
		try {
			const entityData = await EntityType.findAll({
				where: {
					[Op.or]: [
						{
							created_by: 0,
						},
						{
							organization_id: orgId,
						},
					],
					...filter,
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
			const entityTypes = await EntityType.findAll({
				where: filter,
			})

			const result = await Promise.all(
				entityTypes.map(async (entityType) => {
					const entities = await Entity.findAll({
						where: { entity_type_id: entityType.id },
						//attributes: { exclude: ['entity_type_id'] },
					})

					return {
						...entityType.toJSON(),
						entities: entities.map((entity) => entity.toJSON()),
					}
				})
			)

			return result
		} catch (error) {
			console.error('Error fetching data:', error)
			throw error
		}
	}

	static async findUserEntityTypesAndEntitiesRaw(filter) {
		try {
			const [result, metadata] = await Sequelize.query(
				`SELECT
				et.*,
				jsonb_agg(e.*) AS entities
			FROM
				entity_types et
			LEFT JOIN
				entities e ON et.id = e.entity_type_id
			WHERE
				et.status = 'ACTIVE'
				AND et.value IN ('medium')
				AND et.organization_id IN (1,1)
			GROUP BY
				et.id
			ORDER BY
				et.id;`
			)
			return result
		} catch (error) {
			console.error('Error fetching data:', error)
			throw error
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

	static async findAllEntityTypesAndEntities(filter) {
		try {
			const entityTypes = await EntityType.findAll({
				where: filter,
			})

			const result = await Promise.all(
				entityTypes.map(async (entityType) => {
					const entities = await Entity.findAll({
						where: { entity_type_id: entityType.id, status: 'ACTIVE' },
						//attributes: { exclude: ['entity_type_id'] },
					})

					return {
						...entityType.toJSON(),
						entities: entities.map((entity) => entity.toJSON()),
					}
				})
			)

			return result
		} catch (error) {
			return error
		}
	}
}
