'use strict'
const FileUpload = require('../models/index').FileUpload

exports.create = async (data) => {
	try {
		const createFileUpload = await FileUpload.create(data)
		const result = createFileUpload.get({ plain: true })
		return result
	} catch (error) {
		return error
	}
}

exports.findOne = async (filter, options = {}) => {
	try {
		return await FileUpload.findOne({
			where: filter,
			...options,
			raw: true,
		})
	} catch (error) {
		return error
	}
}

exports.update = async (filter, update, options = {}) => {
	try {
		const [res] = await FileUpload.update(update, {
			where: filter,
			...options,
			individualHooks: true,
		})

		return res
	} catch (error) {
		return error
	}
}

exports.listUploads = async (page, limit, status, organization_id) => {
	try {
		let filterQuery = {
			where: {},
			attributes: {
				exclude: ['created_at', 'updated_at', 'deleted_at', 'updated_by'],
			},
			offset: parseInt((page - 1) * limit, 10),
			limit: parseInt(limit, 10),
		}

		if (organization_id) {
			filterQuery.where.organization_id = organization_id
		}

		if (status) {
			filterQuery.where.status = status
		}

		const result = await FileUpload.findAndCountAll(filterQuery)
		const transformedResult = {
			count: result.count,
			data: result.rows.map((row) => {
				return row.get({ plain: true })
			}),
		}
		return transformedResult
	} catch (error) {
		return error
	}
}
