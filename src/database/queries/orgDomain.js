'use strict'
const organizationDomain = require('../models/index').OrganizationDomain

exports.create = async (data) => {
	try {
		let createdDomain = await organizationDomain.create(data)
		return createdDomain.get({ plain: true })
	} catch (error) {
		return error
	}
}

exports.findOne = async (filter, options = {}) => {
	try {
		return await organizationDomain.findOne({
			where: filter,
			...options,
			raw: true,
		})
	} catch (error) {
		return error
	}
}

exports.findAll = async (filter, options = {}) => {
	try {
		return await organizationDomain.findAll({
			where: filter,
			...options,
			raw: true,
		})
	} catch (error) {
		return error
	}
}
