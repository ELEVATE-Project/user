/**
 * name : entities.js
 * author : Aman
 * created-date : 02-Nov-2021
 * Description : user entity related information.
 */

// Dependencies

const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const entitiesQueries = require('@database/queries/entities')
const { UniqueConstraintError, ForeignKeyConstraintError } = require('sequelize')
const { Op } = require('sequelize')

module.exports = class UserEntityHelper {
	/**
	 * Create entity.
	 * @method
	 * @name create
	 * @param {Object} bodyData - entity body data.
	 * @param {String} id -  id.
	 * @returns {JSON} - Entity created response.
	 */

	static async create(bodyData, userId, roles = []) {
		try {
			let isAdmin = false
			if (roles && roles.length > 0) {
				isAdmin = roles.some((role) => role.title === common.roleAdmin)
			}

			if (!isAdmin) {
				bodyData.type = common.roleUser
				bodyData.created_by = userId
				bodyData.updated_by = userId
			} else {
				bodyData.type = common.typeSystem
			}
			const entity = await entitiesQueries.create(bodyData)
			return common.successResponse({
				statusCode: httpStatusCode.created,
				message: 'ENTITY_CREATED_SUCCESSFULLY',
				result: entity,
			})
		} catch (error) {
			if (error instanceof UniqueConstraintError) {
				return common.failureResponse({
					message: 'ENTITY_ALREADY_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			if (error instanceof ForeignKeyConstraintError) {
				return common.failureResponse({
					message: 'ENTITY_TYPE_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			throw error
		}
	}

	/**
	 * Update entity.
	 * @method
	 * @name update
	 * @param {Object} bodyData - entity body data.
	 * @param {String} id - entity id.
	 * @param {String} loggedInUserId - logged in user id.
	 * @returns {JSON} - Entity updted response.
	 */

	static async update(bodyData, id, loggedInUserId, roles = []) {
		try {
			let isAdmin = false
			if (roles && roles.length > 0) {
				isAdmin = roles.some((role) => role.title === common.roleAdmin)
			}

			if (!isAdmin) {
				bodyData.type = common.roleUser
				bodyData.updated_by = loggedInUserId
			} else {
				bodyData.type = common.typeSystem
			}
			const rowsAffected = await entitiesQueries.updateOne({ id: id }, bodyData)

			if (rowsAffected == 0) {
				return common.failureResponse({
					message: 'ENTITY_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			return common.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'ENTITY_UPDATED_SUCCESSFULLY',
			})
		} catch (error) {
			if (error instanceof UniqueConstraintError) {
				return common.failureResponse({
					message: 'ENTITY_ALREADY_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			throw error
		}
	}

	/**
	 * Read entity.
	 * @method
	 * @name read
	 * @param {Object} bodyData - entity body data.
	 * @returns {JSON} - Entity read response.
	 */

	static async read(query, userId) {
		try {
			let filter
			if (query.id) {
				filter = {
					[Op.or]: [
						{
							id: query.id,
							created_by: null,
						},
						{ id: query.id, created_by: userId },
					],
				}
			} else {
				filter = {
					[Op.or]: [
						{
							value: query.value,
							created_by: null,
						},
						{ value: query.value, created_by: userId },
					],
				}
			}
			const entities = await entitiesQueries.findAll(filter)

			if (!entities.length) {
				return common.failureResponse({
					message: 'ENTITY_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'ENTITY_FETCHED_SUCCESSFULLY',
				result: entities,
			})
		} catch (error) {
			throw error
		}
	}

	static async readAll(query, userId) {
		try {
			let filter
			if (query.read_user_entity) {
				filter = {
					[Op.or]: [
						{
							created_by: null,
						},
						{
							created_by: userId,
						},
					],
				}
			} else {
				filter = {
					created_by: null,
				}
			}
			const entities = await entitiesQueries.findAll(filter)

			if (!entities.length) {
				return common.failureResponse({
					message: 'ENTITY_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'ENTITY_FETCHED_SUCCESSFULLY',
				result: entities,
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * Delete entity.
	 * @method
	 * @name delete
	 * @param {String} _id - Delete entity.
	 * @returns {JSON} - Entity deleted response.
	 */

	static async delete(id, userId = null) {
		try {
			const rowsAffected = await entitiesQueries.delete(id, userId)
			if (rowsAffected == 0) {
				return common.failureResponse({
					message: 'ENTITY_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			return common.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'ENTITY_DELETED_SUCCESSFULLY',
				result: {},
			})
		} catch (error) {
			throw error
		}
	}
}
