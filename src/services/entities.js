// Dependencies
const httpStatusCode = require('@generics/http-status')
const entityQueries = require('@database/queries/entities')
const { UniqueConstraintError, ForeignKeyConstraintError } = require('sequelize')
const responses = require('@helpers/responses')
const common = require('@constants/common')
const cacheClient = require('@generics/cacheHelper')

module.exports = class EntityHelper {
	static async _invalidateEntityCaches({ tenantCode, organizationCode }) {
		try {
			await cacheClient.evictNamespace({
				tenantCode,
				orgId: organizationCode,
				ns: common.CACHE_CONFIG.namespaces.entity_types.name,
			})

			await cacheClient.evictNamespace({
				tenantCode,
				orgId: organizationCode,
				ns: common.CACHE_CONFIG.namespaces.profile.name,
			})

			if (process.env.DEFAULT_ORGANISATION_CODE === organizationCode) {
				await cacheClient.evictTenantByPattern(tenantCode, {
					patternSuffix: `org:*:${common.CACHE_CONFIG.namespaces.entity_types.name}:*`,
				})
				await cacheClient.evictTenantByPattern(tenantCode, {
					patternSuffix: `org:*:${common.CACHE_CONFIG.namespaces.profile.name}:*`,
				})
			}
		} catch (err) {
			console.error('Entity cache invalidation failed', err)
			// Do not throw. Cache failures should not block DB ops.
		}
	}

	/**
	 * Create entity.
	 * @method
	 * @name create
	 * @param {Object} bodyData - entity body data.
	 * @param {String} id -  id.
	 * @returns {JSON} - Entity created response.
	 */
	static async create(bodyData, userId, tenantCode, organizationCode) {
		bodyData.created_by = userId
		bodyData.updated_by = userId
		bodyData.tenant_code = tenantCode
		bodyData.organization_code = organizationCode

		try {
			const entity = await entityQueries.createEntity(bodyData)

			// invalidate caches after successful create
			await this._invalidateEntityCaches({ tenantCode, organizationCode })

			return responses.successResponse({
				statusCode: httpStatusCode.created,
				message: 'ENTITY_CREATED_SUCCESSFULLY',
				result: entity,
			})
		} catch (error) {
			if (error instanceof UniqueConstraintError) {
				return responses.failureResponse({
					message: 'ENTITY_ALREADY_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			if (error instanceof ForeignKeyConstraintError) {
				return responses.failureResponse({
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
	static async update(bodyData, id, loggedInUserId, organizationCode, tenantCode) {
		bodyData.updated_by = loggedInUserId
		try {
			const [updateCount, updatedEntity] = await entityQueries.updateOneEntity(
				id,
				bodyData,
				organizationCode,
				tenantCode,
				{
					returning: true,
					raw: true,
				}
			)

			if (updateCount === 0) {
				return responses.failureResponse({
					message: 'ENTITY_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			// invalidate caches after successful update
			await this._invalidateEntityCaches({ tenantCode, organizationCode })

			return responses.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'ENTITY_UPDATED_SUCCESSFULLY',
				result: updatedEntity,
			})
		} catch (error) {
			if (error instanceof UniqueConstraintError) {
				return responses.failureResponse({
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
	static async read(query, tenantCode) {
		try {
			let filter
			if (query.id) {
				filter = {
					id: query.id,
					status: 'ACTIVE',
					tenant_code: tenantCode,
				}
			} else {
				filter = {
					value: query.value,
					entity_type_id: query.entity_type_id,
					tenant_code: tenantCode,
					status: 'ACTIVE',
				}
			}
			const entities = await entityQueries.findAllEntities(filter)

			if (!entities.length) {
				return responses.failureResponse({
					message: 'ENTITY_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			return responses.successResponse({
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
	static async delete(id, organizationCode, tenantCode) {
		try {
			const deleteCount = await entityQueries.deleteOneEntity(id, organizationCode, tenantCode)

			if (deleteCount === 0) {
				return responses.failureResponse({
					message: 'ENTITY_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			// invalidate caches after successful delete
			await this._invalidateEntityCaches({ tenantCode, organizationCode })

			return responses.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'ENTITY_DELETED_SUCCESSFULLY',
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * Get list of entity
	 * @method
	 * @name list
	 * @param {Object} query - query params
	 * @param {String} userId - logged in user id.
	 * @param {String} searchText - search label in entity.
	 * @param {Integer} page -  page no.
	 * @param {Integer} pageSize -  page limit per api.
	 * @returns {JSON} - Entity search matched response.
	 */
	static async list(query, searchText, pageNo, pageSize) {
		try {
			let entityType = query.entity_type_id ? query.entity_type_id : ''
			let filter = {}
			if (entityType) {
				filter['entity_type_id'] = entityType
			}

			const attributes = ['id', 'entity_type_id', 'value', 'label', 'status', 'type', 'created_by', 'created_at']
			const entities = await entityQueries.getAllEntities(filter, attributes, pageNo, pageSize, searchText)

			if (entities.rows == 0 || entities.count == 0) {
				return responses.failureResponse({
					message: 'ENTITY_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			} else {
				const results = {
					data: entities.rows,
					count: entities.count,
				}

				return responses.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'ENTITY_FETCHED_SUCCESSFULLY',
					result: results,
				})
			}
		} catch (error) {
			throw error
		}
	}
}
