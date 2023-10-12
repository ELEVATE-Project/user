// Dependencies
const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const entityTypeQueries = require('../database/queries/entity')
const { UniqueConstraintError, ForeignKeyConstraintError } = require('sequelize')
const { Op } = require('sequelize')

module.exports = class EntityHelper {
	/**
	 * Create entity.
	 * @method
	 * @name create
	 * @param {Object} bodyData - entity body data.
	 * @param {String} id -  id.
	 * @returns {JSON} - Entity created response.
	 */

	static async create(bodyData, id) {
		bodyData.created_by = id
		bodyData.updated_by = id
		try {
			const entity = await entityTypeQueries.createEntity(bodyData)
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
	 * @param {String} _id - entity id.
	 * @param {String} loggedInUserId - logged in user id.
	 * @returns {JSON} - Entity updated response.
	 */

	static async update(bodyData, id, loggedInUserId) {
		bodyData.updated_by = loggedInUserId
		try {
			const [updateCount, updatedEntity] = await entityTypeQueries.updateOneEntity(id, bodyData, loggedInUserId, {
				returning: true,
				raw: true,
			})

			if (updateCount === 0) {
				return common.failureResponse({
					message: 'ENTITY_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			return common.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'ENTITY_UPDATED_SUCCESSFULLY',
				result: updatedEntity,
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
							created_by: '0',
							status: 'ACTIVE',
						},
						{ id: query.id, created_by: userId, status: 'ACTIVE' },
					],
				}
			} else {
				filter = {
					[Op.or]: [
						{
							value: query.value,
							created_by: '0',
							status: 'ACTIVE',
						},
						{ value: query.value, created_by: userId, status: 'ACTIVE' },
					],
				}
			}
			const entities = await entityTypeQueries.findAllEntities(filter)

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
			if (query.read_user_entity == true) {
				filter = {
					[Op.or]: [
						{
							created_by: '0',
						},
						{
							created_by: userId,
						},
					],
				}
			} else {
				filter = {
					created_by: '0',
				}
			}
			const entities = await entityTypeQueries.findAllEntities(filter)

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

	static async delete(id, userId) {
		try {
			const deleteCount = await entityTypeQueries.deleteOneEntityType(id, userId)
			if (deleteCount === '0') {
				return common.failureResponse({
					message: 'ENTITY_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			return common.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'ENTITY_DELETED_SUCCESSFULLY',
			})
		} catch (error) {
			throw error
		}
	}
}
