'use strict'
const database = require('@database/models/index')

const { Op } = require('sequelize')

exports.create = async (data) => {
	try {
		return await database.User.create(data)
	} catch (error) {
		return error
	}
}

exports.findOne = async (filter) => {
	try {
		return await database.User.findOne(filter)
	} catch (error) {
		return error
	}
}

exports.updateUser = async (update, filter, options) => {
	try {
		let data = await database.User.update(update, filter, options)
		return data
	} catch (error) {
		return error
	}
}

exports.findByPk = async (id) => {
	try {
		return await database.User.findByPk(id)
	} catch (error) {
		return error
	}
}

exports.findAll = async (filter) => {
	try {
		return await database.User.findAll(filter)
	} catch (error) {
		return error
	}
}

exports.findOneWithAssociation = async (filter, associationTable, associatioName) => {
	try {
		filter.include = [{ model: database[associationTable], as: associatioName }]
		return await database.User.findOne(filter)
	} catch (error) {
		return error
	}
}

exports.listUsers = async (roleId, page, limit, search) => {
	try {
		let filterQuery = {
			where: { deleted: false },
			raw: true,
			attributes: ['id', 'name', 'image'],
			offset: parseInt((page - 1) * limit, 10),
			limit: parseInt(limit, 10),
			order: [['name', 'ASC']],
		}

		if (search) {
			filterQuery.where.name = {
				[Op.iLike]: search + '%',
			}
		}

		if (roleId) {
			filterQuery.where.roles = { [Op.contains]: [roleId] }
		}

		return await database.User.findAndCountAll(filterQuery)
	} catch (error) {
		return error
	}
}
