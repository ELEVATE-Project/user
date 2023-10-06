'use strict'
const Organization = require('@database/models/index').Organization
const { Op } = require('sequelize')
const common = require('@constants/common')

exports.create = async (data) => {
	try {
		const createdOrg = await Organization.create(data)
		return createdOrg.get({ plain: true })
	} catch (error) {
		return error
	}
}

exports.findOne = async (filter, options) => {
	try {
		return await Organization.findOne({
			where: filter,
			...options,
			raw: true,
		})
	} catch (error) {
		return error
	}
}

exports.update = async (filter, update, options) => {
	try {
		const [res] = await Organization.update(update, {
			where: filter,
			...options,
			individualHooks: true,
		})
		return res
	} catch (error) {
		return error
	}
}

exports.listOrganizations = async (page, limit, search) => {
	try {
		let filterQuery = {
			where: { status: common.activeStatus },
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
		return await Organization.findByPk(id)
	} catch (error) {
		return error
	}
}
