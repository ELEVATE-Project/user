'use strict'
const Tenant = require('@database/models/index').Tenant
const Organization = require('@database/models/index').Organization

exports.findOne = async (filter, options = {}) => {
	try {
		const queryOptions = {
			where: filter,
			attributes: options.attributes || undefined,
			raw: options.raw || false, // Make `raw: true` optional
			separate: true, // Only relevant when using includes
		}

		// If organization attributes are specified, add join
		if (options.organizationAttributes?.length > 0) {
			queryOptions.include = [
				{
					model: Organization,
					as: 'organizations',
					attributes: options.organizationAttributes,
				},
			]
		}

		return await Tenant.findOne(queryOptions)
	} catch (error) {
		throw error
	}
}

exports.findByPk = async (id) => {
	try {
		return await Tenant.findByPk(id, { raw: true })
	} catch (error) {
		return error
	}
}

exports.findAll = async (filter, options = {}) => {
	try {
		const limit = filter.limit
		const offset = filter.offset
		delete filter.limit
		delete filter.offset
		return await Tenant.findAll({
			where: filter,
			...options,
			limit,
			offset,
			raw: true,
		})
	} catch (error) {
		return error
	}
}

exports.create = async (data, user_organization_id) => {
	try {
		return await Tenant.create(data, { returning: true })
	} catch (error) {
		throw error
	}
}

exports.update = async (filter, updatedata) => {
	try {
		return await Tenant.update(updatedata, {
			where: filter,
			returning: true,
			raw: true,
		})
	} catch (error) {
		throw error
	}
}

exports.hardDelete = async (code) => {
	try {
		await Tenant.destroy({
			where: { code },
			force: true,
		})
		return true
	} catch (error) {
		throw error
	}
}
