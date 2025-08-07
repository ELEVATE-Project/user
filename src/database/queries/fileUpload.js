'use strict'
const FileUpload = require('@database/models/index').FileUpload

exports.create = async (data) => {
	try {
		const createFileUpload = await FileUpload.create(data)
		const result = createFileUpload.get({ plain: true })
		return result
	} catch (error) {
		throw error
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
		throw error
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
		throw error
	}
}

exports.listUploads = async ({ page, limit, filter = {} } = {}) => {
	try {
		const result = await FileUpload.findAndCountAll({
			where: filter,
			attributes: {
				exclude: ['created_at', 'updated_at', 'deleted_at', 'updated_by'],
			},
			offset: (page - 1) * limit,
			limit,
			raw: true,
		})

		return {
			count: result.count,
			data: result.rows,
		}
	} catch (error) {
		throw error
	}
}
