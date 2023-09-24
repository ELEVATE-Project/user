const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const entityTypeQueries = require('@database/queries/entityType')
const { UniqueConstraintError } = require('sequelize')
const utilsHelper = require('@generics/utils')

module.exports = class EntityHelper {
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
				isAdmin = utilsHelper.isAdmin(roles)
			}

			if (!isAdmin) {
				bodyData.created_by = userId
				bodyData.updated_by = userId
			}

			const entityType = await entityTypeQueries.create(bodyData)
			return common.successResponse({
				statusCode: httpStatusCode.created,
				message: 'ENTITY_TYPE_CREATED_SUCCESSFULLY',
				result: entityType,
			})
		} catch (error) {
			if (error instanceof UniqueConstraintError) {
				return common.failureResponse({
					message: 'ENTITY_TYPE_ALREADY_EXISTS',
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
	 * @returns {JSON} - Entity updted response.
	 */

	static async update(bodyData, id, loggedInUserId, roles = []) {
		try {
			let isAdmin = false
			if (roles && roles.length > 0) {
				isAdmin = utilsHelper.isAdmin(roles)
			}

			if (!isAdmin) {
				bodyData.updated_by = loggedInUserId
			}
			const rowsAffected = await entityTypeQueries.updateOne({ id: id }, bodyData)

			if (rowsAffected == 0) {
				return common.failureResponse({
					message: 'ENTITY_TYPE_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			return common.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'ENTITY_TYPE_UPDATED_SUCCESSFULLY',
			})
		} catch (error) {
			if (error instanceof UniqueConstraintError) {
				return common.failureResponse({
					message: 'ENTITY_TYPE_ALREADY_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			throw error
		}
	}

	static async readAllSystemEntityTypes() {
		try {
			const entityTypes = await entityTypeQueries.findAllSystemEntityTypes({ created_by: null })

			if (!entityTypes.length) {
				return common.failureResponse({
					message: 'ENTITY_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'ENTITY_FETCHED_SUCCESSFULLY',
				result: entityTypes,
			})
		} catch (error) {
			throw error
		}
	}

	static async readUserEntityTypes(body, userId) {
		try {
			const filter = {
				value: body.value,
				created_by: null,
			}
			const entityTypes = await entityTypeQueries.findAllUserEntityTypes(filter, userId)

			if (!entityTypes.length) {
				return common.failureResponse({
					message: 'ENTITY_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'ENTITY_FETCHED_SUCCESSFULLY',
				result: { entity_types: entityTypes },
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

	static async delete(id) {
		try {
			const rowsAffected = await entityTypeQueries.delete({ id: id })
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
			})
		} catch (error) {
			throw error
		}
	}
}
