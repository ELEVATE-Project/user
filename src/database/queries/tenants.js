'use strict'
const Tenant = require('@database/models/index').Tenant

exports.findOne = async (filter, options = {}) => {
	try {
		return await Tenant.findOne({
			where: filter,
			attributes: options.attributes || undefined,
			...options,
			raw: true,
		})
	} catch (error) {
		return error
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
		return await Tenant.findAll({
			where: filter,
			...options,
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
