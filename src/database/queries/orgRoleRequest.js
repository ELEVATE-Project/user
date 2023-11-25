'use strict'
const OrganizationRoleRequests = require('../models/index').OrganizationRoleRequests
const User = require('../models/index').User
const { Op } = require('sequelize')

exports.create = async (data) => {
	try {
		let createdReq = await OrganizationRoleRequests.create(data)
		return createdReq.get({ plain: true })
	} catch (error) {
		return error
	}
}

exports.findOne = async (filter, options = {}) => {
	try {
		return await OrganizationRoleRequests.findOne({
			where: filter,
			...options,
			raw: true,
		})
	} catch (error) {
		return error
	}
}

exports.requestDetails = async (filter, options = {}) => {
	try {
		const reqDetails = await OrganizationRoleRequests.findOne({
			where: filter,
			...options,
			include: [
				{
					model: User,
					as: 'requester',
					attributes: ['id', 'name'],
				},
				{
					model: User,
					required: false,
					as: 'handler',
					attributes: ['id', 'name'],
				},
			],
		})

		const result = reqDetails.get({ plain: true })
		return result
	} catch (error) {
		console.log(error)
		return error
	}
}

exports.listAllRequests = async (filter, page, limit, options = {}) => {
	try {
		let filterQuery = {
			where: filter,
			...options,
			offset: parseInt((page - 1) * limit, 10),
			limit: parseInt(limit, 10),
			order: [['created_at', 'DESC']],
			include: [
				{
					model: User,
					as: 'requester',
					attributes: ['id', 'name'],
				},
				{
					model: User,
					required: false,
					as: 'handler',
					attributes: ['id', 'name'],
				},
			],
		}

		const result = await OrganizationRoleRequests.findAndCountAll(filterQuery)
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

exports.update = async (filter, update, options = {}) => {
	try {
		const [res] = await OrganizationRoleRequests.update(update, {
			where: filter,
			...options,
			individualHooks: true,
		})
		return res
	} catch (error) {
		return error
	}
}
