'use strict'

const { UserOrganization, Organization, sequelize } = require('@database/models/index')
const { Op } = require('sequelize')

exports.create = async (data) => {
	try {
		const createdUserOrg = await UserOrganization.create(data)
		return createdUserOrg.get({ plain: true })
	} catch (error) {
		console.error(error)
		return error
	}
}

exports.findOne = async (filter, options = {}) => {
	try {
		return await UserOrganization.findOne({
			where: filter,
			...options,
			raw: true,
		})
	} catch (error) {
		console.error(error)
		return error
	}
}

exports.findAll = async (filter = {}, options = {}) => {
	try {
		if (options.organizationAttributes.length > 0) {
			options.include = [
				{
					model: Organization,
					attributes: options.organizationAttributes,
					as: 'organization',
				},
			]
		}
		return await UserOrganization.findAll({
			where: filter,
			...options,
			raw: true,
		})
	} catch (error) {
		console.error(error)
		return error
	}
}

exports.update = async (filter, updates) => {
	const transaction = await sequelize.transaction()
	try {
		await UserOrganization.update(updates, {
			where: filter,
			transaction,
		})
		await transaction.commit()
		return { success: true }
	} catch (error) {
		await transaction.rollback()
		console.error(error)
		return error
	}
}

exports.delete = async (filter) => {
	const transaction = await sequelize.transaction()
	try {
		await UserOrganization.destroy({
			where: filter,
			transaction,
		})
		await transaction.commit()
		return { success: true }
	} catch (error) {
		await transaction.rollback()
		console.error(error)
		return error
	}
}
