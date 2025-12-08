'use strict'
const { TenantDomain, Tenant } = require('@database/models/index')

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

// Fetch tenant domain with tenant details in a single query
exports.findOneWithTenant = async (filter, options = {}) => {
	try {
		const result = await TenantDomain.findOne({
			where: filter,
			attributes: options.attributes || undefined,
			include: [
				{
					model: Tenant,
					as: 'tenant',
					required: false, // LEFT JOIN to allow separate validation
					attributes: options.tenantAttributes || [
						'code',
						'name',
						'status',
						'description',
						'logo',
						'meta',
						'theming',
					],
				},
			],
			raw: false, // Need nested object structure
		})

		if (!result) return null

		// Convert to plain object and flatten structure for easier access
		const plainResult = result.get({ plain: true })
		return plainResult
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
