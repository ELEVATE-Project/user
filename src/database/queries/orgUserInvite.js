'use strict'
const organizationUserInvite = require('../models/index').OrganizationUserInvite
const { UniqueConstraintError, ValidationError } = require('sequelize')

exports.create = async (data) => {
	try {
		const createData = await organizationUserInvite.create(data)
		const result = createData.get({ plain: true })
		return result
	} catch (error) {
		if (error instanceof UniqueConstraintError) {
			return 'USER_ALREADY_EXISTS'
		} else if (error instanceof ValidationError) {
			let message
			error.errors.forEach((err) => {
				message = `${err.path} cannot be null.`
			})
			return message
		} else {
			return error.message
		}
	}
}

exports.update = async (filter, update, options) => {
	try {
		const [res] = await organizationUserInvite.update(update, {
			where: filter,
			...options,
			individualHooks: true,
		})
		return res
	} catch (error) {
		return error
	}
}

exports.findOne = async (filter, options = {}) => {
	try {
		return await organizationUserInvite.findOne({
			where: filter,
			...options,
			raw: true,
		})
	} catch (error) {
		return error
	}
}
