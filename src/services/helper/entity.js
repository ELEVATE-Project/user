// DependenciesI
const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const KafkaProducer = require('@generics/kafka-communication')
const utils = require('@generics/utils')

const entityTypeQueries = require('../../database/queries/entity')
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
		bodyData.created_by = '0' || id
		bodyData.updated_by = '0' || id
		try {
			const entityType = await entityTypeQueries.createEntityType(bodyData)
			return common.successResponse({
				statusCode: httpStatusCode.created,
				message: 'ENTITY_CREATED_SUCCESSFULLY',
				result: entityType,
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
	 * @returns {JSON} - Entity updted response.
	 */

	static async update(bodyData, id, loggedInUserId) {
		bodyData.updated_by = 1 || loggedInUserId
		//bodyData.updatedAt = new Date().getTime()
		try {
			const result = await entityTypeQueries.updateOneEntity(id, bodyData)

			if (result === 'ENTITY_NOT_FOUND') {
				return common.failureResponse({
					message: 'ENTITY_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			let key = ''
			if (bodyData.type) {
				key = 'entity_' + bodyData.value
			} else {
				const entityType = await entityTypeQueries.findEntityTypeById(id)
				key = 'entityType_' + entityType.value
			}
			await utils.internalDel(key)
			await KafkaProducer.clearInternalCache(key)
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

	static async read(bodyData) {
		try {
			const key = 'entity_' + bodyData.value
			let entities = /*  (await utils.internalGet(key)) ||  */ false

			if (!entities) {
				const filter = { entity_type_id: bodyData.entity_type_id, created_by: 0 }

				entities = await entityTypeQueries.findAllEntities(filter)
				console.log(entities, 'sssssss')
				await utils.internalSet(key, entities)
			}
			if (!entities) {
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

	static async readUserEntity(bodyData, userId) {
		try {
			userId = 1
			const key = 'entity_' + bodyData.value + '_' + userId
			let entities = /*  (await utils.internalGet(key)) ||  */ false

			if (!entities) {
				const filter = {
					[Op.or]: [
						{
							entity_type_id: bodyData.entity_type_id,
							created_by: 0,
						},
						{
							entity_type_id: bodyData.entity_type_id,
							created_by: userId,
						},
					],
				}
				entities = await entityTypeQueries.findAllEntities(filter)
				entities = entities.reduce((acc, entity) => {
					const entityTypeValue = entity.entity_type.value
					if (!acc[entityTypeValue]) {
						acc[entityTypeValue] = []
					}
					acc[entityTypeValue].push(entity)
					return acc
				}, {})
				await utils.internalSet(key, entities)
			}
			if (!entities) {
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

	static async delete(id) {
		try {
			const entityType = await entityTypeQueries.findEntityTypeById(id, { paranoid: false })
			let key = 'entityType_' + entityType.value
			await utils.internalDel(key)
			await KafkaProducer.clearInternalCache(key)

			const result = await entityTypeQueries.deleteOneEntityType(id)
			if (result === 'ENTITY_NOT_FOUND') {
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
