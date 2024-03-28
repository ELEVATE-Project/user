/**
 * name         : queries/user-sessions.js
 * author       : Vishnu
 * created-date : 26-Mar-2024
 * Description  : user-sessions table query methods.
 */

// Dependencies
'use strict'
const UserSessions = require('@database/models/index').UserSessions
const { Op } = require('sequelize')

/**
 * Find one record based on the provided filter.
 * @param {Object} filter       - The filter object to specify the condition for selecting the record.
 * @param {Object} options      - Additional options for the query (optional).
 * @returns {Promise<Object>}   - A promise that resolves to the found record or an error.
 */
exports.findOne = async (filter, options = {}) => {
	try {
		return await UserSessions.findOne({
			where: filter,
			...options,
			raw: true,
		})
	} catch (error) {
		return error
	}
}

/**
 * Find a record by its primary key.
 * @param {number|string} id    - The primary key value of the record.
 * @returns {Promise<Object>}   - A promise that resolves to the found record or an error.
 */
exports.findByPk = async (id) => {
	try {
		return await UserSessions.findByPk(id, { raw: true })
	} catch (error) {
		return error
	}
}

/**
 * Find all records based on the provided filter.
 * @param {Object} filter       - The filter object to specify the condition for selecting records.
 * @param {Object} options      - Additional options for the query (optional).
 * @returns {Promise<Array>}    - A promise that resolves to an array of found records or an error.
 */
exports.findAll = async (filter, options = {}) => {
	try {
		return await UserSessions.findAll({
			where: filter,
			...options,
			raw: true,
		})
	} catch (error) {
		return error
	}
}

/**
 * Update records based on the provided filter and update data.
 * @param {Object} filter       - The filter object to specify the condition for updating records.
 * @param {Object} update       - The update data to be applied to matching records.
 * @param {Object} options      - Additional options for the update operation (optional).
 * @returns {Promise<number>}   - A promise that resolves to the number of updated records or an error.
 */
exports.update = async (filter, update, options = {}) => {
	try {
		return await await UserSessions.update(update, {
			where: filter,
			...options,
		})
	} catch (error) {
		return error
	}
}

/**
 * Create a new record with the provided data.
 * @param {Object} data         - The data object representing the record to be created.
 * @returns {Promise<Object>}   - A promise that resolves to the created record or an error.
 */
exports.create = async (data) => {
	try {
		return await UserSessions.create(data, { returning: true })
	} catch (error) {
		throw error
	}
}
