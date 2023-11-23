'use strict'
const database = require('@database/models/index')
const Organization = require('@database/models/index').Organization
const { Op } = require('sequelize')

exports.getColumns = async () => {
	try {
		return await Object.keys(database.User.rawAttributes)
	} catch (error) {
		return error
	}
}
exports.create = async (data) => {
	try {
		console.log('REACHED CREATE FUNCTION')
		return await database.User.create(data)
	} catch (error) {
		console.log(error)
		return error
	}
}

exports.findOne = async (filter, options = {}) => {
	try {
		return await database.User.findOne({
			where: filter,
			...options,
			raw: true,
		})
	} catch (error) {
		return error
	}
}

exports.updateUser = async (filter, update, options = {}) => {
	try {
		return await database.User.update(update, {
			where: filter,
			...options,
			individualHooks: true,
		})
	} catch (error) {
		return error
	}
}

exports.findByPk = async (id) => {
	try {
		return await database.User.findByPk(id, { raw: true })
	} catch (error) {
		return error
	}
}

exports.findAll = async (filter, options = {}) => {
	try {
		return await database.User.findAll({
			where: filter,
			...options,
			raw: true,
		})
	} catch (error) {
		return error
	}
}

exports.listUsers = async (roleId, organization_id, page, limit, search) => {
	try {
		const offset = (page - 1) * limit
		const whereClause = {}

		if (search) {
			whereClause.name = { [Op.iLike]: search + '%' }
		}

		if (roleId) {
			whereClause.roles = { [Op.contains]: [roleId] }
		}

		if (organization_id) {
			whereClause.organization_id = organization_id
		}

		const filterQuery = {
			where: whereClause,
			attributes: ['id', 'name', 'about', 'image'],
			offset: parseInt(offset, 10),
			limit: parseInt(limit, 10),
			order: [['name', 'ASC']],
			include: [
				{
					model: Organization,
					required: false,
					where: {
						status: 'ACTIVE',
					},
					attributes: ['id', 'name', 'code'],
					as: 'organization',
				},
			],
			raw: true,
			nest: true,
		}

		const { count, rows: users } = await database.User.findAndCountAll(filterQuery)

		return { count, data: users }
	} catch (error) {
		throw error
	}
}


exports.findAllUserWithOrganization = async (filter, options = {}) => {
	try {
		return await database.User.findAll({
      where: filter,
			...options,
			include: [
				{
					model: Organization,
					required: false,
					where: {
						status: 'ACTIVE',
					},
					attributes: ['id', 'name', 'code'],
					as: 'organization',
				},
			],
			raw: true,
			nest: true,
		})
	} catch (error) {
		return error
	}
}

exports.findUserWithOrganization = async (filter, options = {}) => {
	try {
		return await database.User.findOne({
			where: filter,
			...options,
			include: [
				{
					model: Organization,
					required: false,
					where: {
						status: 'ACTIVE',
					},
					attributes: ['id', 'name', 'code'],
					as: 'organization',
				},
			],
			raw: true,
			nest: true,
		})
	} catch (error) {
		return error
	}
}
