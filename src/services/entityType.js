// Dependencies
const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const entityTypeQueries = require('@database/queries/entityType')
const { UniqueConstraintError } = require('sequelize')
const { Op } = require('sequelize')
const { removeDefaultOrgEntityTypes } = require('@generics/utils')
const responses = require('@helpers/responses')
const cacheClient = require('@generics/cacheHelper')

module.exports = class EntityHelper {
	static async _invalidateEntityTypeCaches({ tenantCode, organizationCode }) {
		try {
			await cacheClient.invalidateOrgNamespaceVersion({
				tenantCode,
				orgId: organizationCode,
				ns: common.CACHE_CONFIG.namespaces.entity_types.name,
			})

			await cacheClient.invalidateOrgNamespaceVersion({
				tenantCode,
				orgId: organizationCode,
				ns: common.CACHE_CONFIG.namespaces.profile.name,
			})

			if (process.env.DEFAULT_ORGANISATION_CODE === organizationCode) {
				await cacheClient.invalidateNamespaceVersion({
					tenantCode,
					ns: common.CACHE_CONFIG.namespaces.entity_types.name,
				})
				await cacheClient.invalidateNamespaceVersion({
					tenantCode,
					ns: common.CACHE_CONFIG.namespaces.profile.name,
				})
			}
		} catch (err) {
			console.error('Entity type cache invalidation failed', err)
			// Do not throw. Caching failure should not block main operation.
		}
	}

	static async create(bodyData, id, organizationCode, organizationId, tenantCode) {
		bodyData.created_by = id
		bodyData.updated_by = id
		bodyData.organization_code = organizationCode
		bodyData.organization_id = organizationId
		bodyData.tenant_code = tenantCode
		try {
			const entityType = await entityTypeQueries.createEntityType(bodyData)

			// invalidate caches after successful create
			await this._invalidateEntityTypeCaches({ tenantCode, organizationCode })

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

			// invalidate caches after successful update
			await this._invalidateEntityTypeCaches({ tenantCode, organizationCode })

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
			await this._invalidateEntityTypeCaches({ tenantCode, organizationCode })

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
			const filter = {
				value: body.value,
				status: 'ACTIVE',
				tenant_code: tenantCode,
				organization_code: {
					[Op.in]: [process.env.DEFAULT_ORGANISATION_CODE, organizationCode],
				},
			}

			const entities = await entityTypeQueries.findUserEntityTypesAndEntities(filter)

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

	static async delete(id, organizationCode, tenantCode) {
		try {
			const deleteCount = await entityTypeQueries.deleteOneEntityType(id, organizationCode)
			if (deleteCount === 0) {
				return responses.failureResponse({
					message: 'ENTITY_TYPE_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			// invalidate caches after successful delete
			await this._invalidateEntityTypeCaches({ tenantCode, organizationCode })

			return responses.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'ENTITY_TYPE_DELETED_SUCCESSFULLY',
			})
		} catch (error) {
			throw error
		}
	}
}
