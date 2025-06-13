'use strict'
const OrganizationUserInvite = require('../models/index').OrganizationUserInvite
const { ValidationError } = require('sequelize')
const Invitation = require('../models/index').Invitation
const { Op } = require('sequelize')

exports.create = async (data) => {
	try {
		const createData = await OrganizationUserInvite.create(data)
		const result = createData.get({ plain: true })
		return result
	} catch (error) {
		if (error instanceof ValidationError) {
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
		const [res] = await OrganizationUserInvite.update(update, {
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
		const include = [
			{
				model: Invitation,
				as: 'invitation',
				...(options.isValid && {
					where: {
						valid_till: {
							[Op.gte]: new Date(),
						},
					},
					required: true,
				}),
			},
		]

		delete options.isValid

		return await OrganizationUserInvite.findOne({
			where: filter,
			...options,
			include,
			raw: true,
		})
	} catch (error) {
		return error
	}
}

exports.deleteOne = async (id, options = {}) => {
	try {
		const result = await OrganizationUserInvite.destroy({
			where: { id: id },
			...options,
		})
		return result // Returns the number of rows deleted
	} catch (error) {
		return error
	}
}

exports.findAll = async (filter, options = {}) => {
	try {
		return await OrganizationUserInvite.findAll({
			where: filter,
			...options,
			raw: true,
		})
	} catch (error) {
		return error
	}
}
