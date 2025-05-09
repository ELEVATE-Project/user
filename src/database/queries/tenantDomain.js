'use strict'
const { TenantDomain, sequelize } = require('@database/models/index')
const { Op } = require('sequelize')

exports.create = async (data) => {
	try {
		const createdDomain = await TenantDomain.create(data)
		return createdDomain.get({ plain: true })
	} catch (error) {
		console.error(error)
		return error
	}
}

exports.findOne = async (filter, options = {}) => {
	try {
		return await TenantDomain.findOne({
			where: filter,
			attributes: options.attributes || undefined,
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
		return await TenantDomain.findAll({
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
	try {
		await TenantDomain.update(updates, {
			where: filter,
		})
		return { success: true }
	} catch (error) {
		console.error(error)
		return error
	}
}

exports.delete = async (filter) => {
	try {
		await TenantDomain.destroy({
			where: filter,
		})
		return { success: true }
	} catch (error) {
		console.error(error)
		return error
	}
}

exports.hardDelete = async (id) => {
	try {
		await TenantDomain.destroy({
			where: {
				id,
			},
			force: true,
		})
		return { success: true }
	} catch (error) {
		console.error(error)
		return error
	}
}
