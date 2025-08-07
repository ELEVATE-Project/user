const Entity = require('../models/index').Entity
const { Op } = require('sequelize')
const EntityType = require('../models/index').EntityType

module.exports = class UserEntityData {
	static async createEntity(data) {
		try {
			return await Entity.create(data, { returning: true })
		} catch (error) {
			throw error
		}
	}

	static async findAllEntities(filter, options = {}) {
		try {
			return await Entity.findAll({
				where: filter,
				...options,
				raw: true,
			})
		} catch (error) {
			throw error
		}
	}

	static async updateOneEntity(id, update, organizationCode, tenantCode, options = {}) {
		try {
			return await Entity.update(update, {
				where: {
					id: id,
					tenant_code: tenantCode,
					organization_code: organizationCode,
				},
				...options,
			})
		} catch (error) {
			throw error
		}
	}

	static async deleteOneEntity(id, organizationCode, tenantCode) {
		try {
			return await Entity.destroy({
				where: {
					id: id,
					organization_code: organizationCode,
					tenant_code: tenantCode,
				},
			})
		} catch (error) {
			throw error
		}
	}

	static async hardDelete(id) {
		try {
			return await Entity.destroy({
				where: {
					id: id,
				},
				force: true,
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

	static async getAllEntities(filters, attributes, page, limit, search) {
		try {
			return await Entity.findAndCountAll({
				where: {
					[Op.or]: [{ label: { [Op.iLike]: `%${search}%` } }],
					...filters,
				},
				attributes: attributes,
				offset: parseInt((page - 1) * limit, 10),
				limit: parseInt(limit, 10),
				order: [['created_at', 'DESC']],
			})
		} catch (error) {
			throw error
		}
	}

	static async findEntityWithOrgCheck(id, tenantCode, organizationID) {
		return Entity.findOne({
			where: {
				id,
				tenant_code: tenantCode,
			},
			include: [
				{
					model: EntityType,
					as: 'entity_type',
					where: {
						tenant_code: tenantCode,
						organization_id: organizationID,
					},
					required: true,
				},
			],
		})
	}
}
