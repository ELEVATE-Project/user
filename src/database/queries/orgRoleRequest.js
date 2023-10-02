'use strict'
const OrgRoleRequest = require('../models/index').OrgRoleRequest
const User = require('../models/index').User

exports.create = async (data) => {
	try {
		return await OrgRoleRequest.create(data)
	} catch (error) {
		return error
	}
}

exports.findOne = async (filter, options = {}) => {
	try {
		return await OrgRoleRequest.findOne({
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
		const reqDetails = await OrgRoleRequest.findOne({
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
		return error
	}
}
