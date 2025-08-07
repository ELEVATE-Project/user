'use strict'
const { UserOrganizationRole, sequelize } = require('@database/models/index')
const { Op } = require('sequelize')

/**
 * Create a new UserOrganizationRole record
 * @param {Object} data - Data for creation
 */
exports.create = async (data, options = {}) => {
	try {
		const result = await UserOrganizationRole.create(data, options)
		return result.get({ plain: true })
	} catch (error) {
		console.error('Create Error:', error)
		throw error
	}
}

/**
 * Find one UserOrganizationRole record by filter
 * @param {Object} filter - Filter conditions
 * @param {Object} options - Sequelize find options
 */
exports.findOne = async (filter, options = {}) => {
	try {
		return await UserOrganizationRole.findOne({
			where: filter,
			...options,
			raw: true,
		})
	} catch (error) {
		console.error('FindOne Error:', error)
		throw error
	}
}

/**
 * Find all UserOrganizationRole records matching filter
 * @param {Object} filter - Filter conditions
 * @param {Object} options - Sequelize find options
 */
exports.findAll = async (filter, options = {}) => {
	try {
		return await UserOrganizationRole.findAll({
			where: filter,
			...options,
			raw: true,
		})
	} catch (error) {
		console.error('FindAll Error:', error)
		throw error
	}
}

/**
 * Update UserOrganizationRole records
 * @param {Object} values - Fields to update
 * @param {Object} filter - Where condition to find records
 */
exports.update = async (values, filter) => {
	try {
		const [affectedCount] = await UserOrganizationRole.update(values, {
			where: filter,
		})
		return affectedCount
	} catch (error) {
		console.error('Update Error:', error)
		throw error
	}
}

/**
 * Delete UserOrganizationRole records (soft delete with `paranoid: true`)
 * @param {Object} filter - Where condition for deletion
 */
exports.delete = async (filter, options = {}) => {
	try {
		const deletedCount = await UserOrganizationRole.destroy({
			where: filter,
			...options,
		})
		return deletedCount
	} catch (error) {
		console.error('Delete Error:', error)
		throw error
	}
}
