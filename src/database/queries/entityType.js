const EntityType = require('../models/index').EntityType
const Entity = require('../models/index').Entity
const { Op } = require('sequelize')
const Sequelize = require('../models/index').sequelize

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
					organization_id: orgId,
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
				include: [
					{
						model: Entity,
						as: 'entities',
						where: { status: filter.status, tenant_code: filter.tenant_code }, // Ensure tenant isolation and citus compatibility
						required: false, // LEFT JOIN to include entity types with no entities
					},
				],
			})

			const result = entityTypes.map((entityType) => {
				const plainEntityType = entityType.get({ plain: true })
				return {
					...plainEntityType,
					entities: plainEntityType.entities || [], // alias is 'entities'
				}
			})

			return result
		} catch (error) {
			console.error('Error fetching entity types and entities:', error)
			throw new Error(`Failed to fetch data: ${error.message}`)
		}
	}

	/* 	static async findUserEntityTypesAndEntitiesRaw(filter) {
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
	} */

	static async updateOneEntityType(id, organizationId, tenantCode, update, options = {}) {
		try {
			return await EntityType.update(update, {
				where: {
					id: id,
					organization_id: organizationId,
					tenant_code: tenantCode,
				},
				...options,
			})
		} catch (error) {
			throw error
		}
	}

	static async deleteOneEntityType(id, orgId) {
		try {
			return await EntityType.destroy({
				where: {
					id: id,
					organization_id: orgId,
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
				raw: true,
			})

			const entityTypeIds = entityTypes.map((entityType) => entityType.id)

			// Fetch all matching entities using the IDs
			const entities = await Entity.findAll({
				where: { entity_type_id: entityTypeIds, status: 'ACTIVE' },
				raw: true,
				//attributes: { exclude: ['entity_type_id'] },
			})

			const result = entityTypes.map((entityType) => {
				const matchingEntities = entities.filter((entity) => entity.entity_type_id === entityType.id)
				return {
					...entityType,
					entities: matchingEntities,
				}
			})
			return result
		} catch (error) {
			return error
		}
	}
}

exports.hardDelete = async (id) => {
	try {
		await EntityType.destroy({
			where: {
				id,
			},
			force: true,
		})
		return { success: true }
	} catch (error) {
		console.error(error)
		return error
	}
}
