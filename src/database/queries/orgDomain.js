'use strict'
const OrgDomain = require('../models/index').OrgDomain

exports.create = async (data) => {
	try {
		let createdDomain = await OrgDomain.create(data)
		return createdDomain.get({ plain: true })
	} catch (error) {
		return error
	}
}

exports.findOne = async (filter, options = {}) => {
	try {
		return await OrgDomain.findOne({
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
		return await OrgDomain.findAll({
			where: filter,
			...options,
			raw: true,
		})
	} catch (error) {
		return error
	}
}
