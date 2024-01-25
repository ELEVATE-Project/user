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

/* exports.requestDetailsOld = async (filter, options = {}) => {
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
} */
exports.requestDetails = async (filter, options = {}) => {
	try {
		// Step 1: Fetch OrganizationRoleRequests data without including related data
		const reqDetails = await OrganizationRoleRequests.findOne({
			where: filter,
			...options,
			raw: true, // Add raw: true option here
		})

		if (!reqDetails) {
			// Handle the case where no data is found
			return null
		}

		// Step 2: Fetch related data (requester and handler) using separate queries
		const requester = await User.findOne({
			where: { id: reqDetails.requester_id },
			attributes: ['id', 'name'],
			raw: true,
		})

		const handler = reqDetails.handled_by
			? await User.findOne({
					where: { id: reqDetails.handled_by },
					attributes: ['id', 'name'],
					raw: true,
			  })
			: null

		// Step 3: Combine the data and return the result
		const result = {
			...reqDetails,
			requester,
			handler,
		}

		return result
	} catch (error) {
		return error
	}
}

/* exports.listAllRequestsOld = async (filter, page, limit, options = {}) => {
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
} */
exports.listAllRequests = async (filter, page, limit, options = {}, orgId) => {
	try {
		let filterQuery = {
			where: filter,
			...options,
			offset: parseInt((page - 1) * limit, 10),
			limit: parseInt(limit, 10),
			order: [['created_at', 'DESC']],
		}

		// Step 1: Fetch OrganizationRoleRequests data without including related data
		const result = await OrganizationRoleRequests.findAndCountAll(filterQuery)

		// Step 2: Fetch all related User data in a single query
		const userIds = result.rows.map((row) => row.requester_id)
		const handlerIds = result.rows.map((row) => row.handled_by).filter(Boolean)

		const [requesters, handlers] = await Promise.all([
			User.findAll({
				where: { id: userIds, organization_id: orgId },
				attributes: ['id', 'name'],
				raw: true,
			}),
			User.findAll({
				where: { id: handlerIds, organization_id: orgId },
				attributes: ['id', 'name'],
				raw: true,
			}),
		])

		// Step 3: Map the results accordingly
		const data = result.rows.map((row) => {
			const requester = requesters.find((user) => user.id === row.requester_id)
			const handler = handlers.find((user) => user.id === row.handled_by)

			return {
				...row,
				requester,
				handler,
			}
		})

		// Step 4: Combine the data and return the result
		const transformedResult = {
			count: result.count,
			data,
		}

		return transformedResult
	} catch (error) {
		console.log(error)
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
