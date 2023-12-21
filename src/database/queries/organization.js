'use strict'
const { Organization, sequelize, organizationCode } = require('@database/models/index')
const { Op } = require('sequelize')
const common = require('@constants/common')

exports.create = async (data) => {
	try {
		const createdOrg = await Organization.create(data)
		await organizationCode.create({
			code: data.code,
			organization_id: createdOrg.toJSON().id,
		})
		return createdOrg.get({ plain: true })
	} catch (error) {
		console.error(error)
		return error
	}
}

exports.findOne = async (filter, options) => {
	try {
		if (filter.code) {
			const organization = await organizationCode.findOne({
				where: { code: filter.code },
				attributes: ['organization_id'],
				raw: true,
			})
			if (!organization) {
				return null
			}
			delete filter.code
			filter.id = organization.organization_id
		}
		return await Organization.findOne({
			where: filter,
			...options,
			raw: true,
		})
	} catch (error) {
		return error
	}
}

exports.update = async (filter, update, options = {}) => {
	try {
		const result = await Organization.update(update, {
			where: filter,
			...options,
			individualHooks: true,
		})
		const [rowsAffected, updatedRows] = result

		return options.returning ? { rowsAffected, updatedRows } : rowsAffected
	} catch (error) {
		console.log(error)

		return error
	}
}

exports.appendRelatedOrg = async (relatedOrg, ids, options = {}) => {
	try {
		const result = await Organization.update(
			{
				related_orgs: sequelize.fn('array_append', sequelize.col('related_orgs'), relatedOrg),
			},
			{
				where: {
					id: ids,
					[Op.or]: [
						{
							[Op.not]: {
								related_orgs: {
									[Op.contains]: [relatedOrg],
								},
							},
						},
						{
							related_orgs: {
								[Op.is]: null,
							},
						},
					],
				},
				...options,
				individualHooks: true,
			}
		)

		const [rowsAffected, updatedRows] = result
		return options.returning ? { rowsAffected, updatedRows } : rowsAffected
	} catch (error) {
		console.log(error)
		return error
	}
}

exports.removeRelatedOrg = async (removedOrgIds, ids, options = {}) => {
	try {
		const result = await Organization.update(
			{ related_orgs: sequelize.fn('array_remove', sequelize.col('related_orgs'), removedOrgIds) },
			{
				where: {
					id: ids,
				},
				...options,
				individualHooks: true,
			}
		)

		const [rowsAffected, updatedRows] = result
		return options.returning ? { rowsAffected, updatedRows } : rowsAffected
	} catch (error) {
		console.log(error)
		return error
	}
}
exports.listOrganizations = async (page, limit, search) => {
	try {
		let filterQuery = {
			where: { status: common.ACTIVE_STATUS },
			attributes: ['id', 'name', 'code', 'description'],
			offset: parseInt((page - 1) * limit, 10),
			limit: parseInt(limit, 10),
			order: [['name', 'ASC']],
		}

		if (search) {
			filterQuery.where.name = {
				[Op.iLike]: search + '%',
			}
		}

		const result = await Organization.findAndCountAll(filterQuery)
		const transformedResult = {
			count: result.count,
			data: result.rows.map((row) => {
				return row.get({ plain: true })
			}),
		}
		return transformedResult
	} catch (error) {
		return error
	}
}

exports.findAll = async (filter, options = {}) => {
	try {
		return await Organization.findAll({
			where: filter,
			...options,
			raw: true,
		})
	} catch (error) {
		return error
	}
}

exports.findByPk = async (id) => {
	try {
		return await Organization.findByPk(id, { raw: true })
	} catch (error) {
		return error
	}
}
