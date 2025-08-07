// DependenciesI
const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const entityTypeQueries = require('@database/queries/entityType')
const { UniqueConstraintError } = require('sequelize')
const organizationQueries = require('@database/queries/organization')
const { Op } = require('sequelize')
const { removeDefaultOrgEntityTypes } = require('@generics/utils')
const responses = require('@helpers/responses')
module.exports = class EntityHelper {
	/**
	 * Create entity type.
	 * @method
	 * @name create
	 * @param {Object} bodyData - entity type body data.
	 * @param {String} id -  id.
	 * @returns {JSON} - Created entity type response.
	 */

	static async create(bodyData, id, organizationCode, organizationId, tenantCode) {
		bodyData.created_by = id
		bodyData.updated_by = id
		bodyData.organization_code = organizationCode
		bodyData.organization_id = organizationId
		bodyData.tenant_code = tenantCode
		try {
			const entityType = await entityTypeQueries.createEntityType(bodyData)
			return responses.successResponse({
				statusCode: httpStatusCode.created,
				message: 'ENTITY_TYPE_CREATED_SUCCESSFULLY',
				result: entityType,
			})
		} catch (error) {
			if (error instanceof UniqueConstraintError) {
				return responses.failureResponse({
					message: 'ENTITY_TYPE_ALREADY_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			throw error
		}
	}

	/**
	 * Update entity type.
	 * @method
	 * @name update
	 * @param {Object} bodyData -  body data.
	 * @param {String} id - entity type id.
	 * @param {String} loggedInUserId - logged in user id.
	 * @returns {JSON} - Updated Entity Type.
	 */

	static async update(bodyData, id, loggedInUserId, organizationCode, tenantCode) {
		;(bodyData.updated_by = loggedInUserId), (bodyData.organization_code = organizationCode)
		try {
			const [updateCount, updatedEntityType] = await entityTypeQueries.updateOneEntityType(
				id,
				organizationCode,
				tenantCode,
				bodyData,
				{
					returning: true,
					raw: true,
				}
			)

			if (updateCount === 0) {
				return responses.failureResponse({
					message: 'ENTITY_TYPE_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			return responses.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'ENTITY_TYPE_UPDATED_SUCCESSFULLY',
				result: updatedEntityType,
			})
		} catch (error) {
			if (error instanceof UniqueConstraintError) {
				return responses.failureResponse({
					message: 'ENTITY_TYPE_ALREADY_DELETED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			throw error
		}
	}

	static async readAllSystemEntityTypes(organizationCode, tenantCode, organizationId) {
		try {
			const attributes = ['value', 'label', 'id', 'organization_code']

			const entities = await entityTypeQueries.findAllEntityTypes(
				[organizationCode, process.env.DEFAULT_ORGANISATION_CODE],
				attributes,
				{
					tenant_code: tenantCode,
				}
			)
			const prunedEntities = removeDefaultOrgEntityTypes(entities, organizationId)

			if (!prunedEntities.length) {
				return responses.failureResponse({
					message: 'ENTITY_TYPE_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'ENTITY_TYPE_FETCHED_SUCCESSFULLY',
				result: prunedEntities,
			})
		} catch (error) {
			throw error
		}
	}

	static async readUserEntityTypes(body, organizationCode, tenantCode, organizationId = '') {
		try {
			// Include tenant_code in filter for consistency with schema
			const filter = {
				value: body.value,
				status: 'ACTIVE',
				tenant_code: tenantCode, // Ensure tenant isolation
				organization_code: {
					[Op.in]: [process.env.DEFAULT_ORGANISATION_CODE, organizationCode],
				},
			}

			const entities = await entityTypeQueries.findUserEntityTypesAndEntities(filter)

			// Deduplicate entity types by value, prioritizing orgId
			const prunedEntities = removeDefaultOrgEntityTypes(entities, organizationId)

			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'ENTITY_TYPE_FETCHED_SUCCESSFULLY',
				result: { entity_types: prunedEntities },
			})
		} catch (error) {
			console.error('Error in readUserEntityTypes:', error)
			throw error
		}
	}
	/**
	 * Delete entity type.
	 * @method
	 * @name delete
	 * @param {String} id - Delete entity type.
	 * @returns {JSON} - Entity deleted response.
	 */

	static async delete(id, organizationCode) {
		try {
			const deleteCount = await entityTypeQueries.deleteOneEntityType(id, organizationCode)
			if (deleteCount === 0) {
				return responses.failureResponse({
					message: 'ENTITY_TYPE_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			return responses.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'ENTITY_TYPE_DELETED_SUCCESSFULLY',
			})
		} catch (error) {
			throw error
		}
	}
}
