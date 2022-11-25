/**
 * name : services/helper/userentity.js
 * author : Aman
 * created-date : 02-Nov-2021
 * Description : user entity reltaed information.
 */

// Dependencies
const ObjectId = require('mongoose').Types.ObjectId
const KafkaProducer = require('@generics/kafka-communication')
const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const userEntitiesData = require('@db/userentities/query')
const utils = require('@generics/utils')

module.exports = class UserEntityHelper {
	/**
	 * create entity
	 * @method
	 * @name create
	 * @param {Object} bodyData - entity information
	 * @param {string} bodyData.code - entity code.
	 * @param {string} bodyData.type - entity type.
	 * @param {string} _id - user id.
	 * @returns {JSON} - returns created entity information
	 */
	static async create(bodyData, _id) {
		bodyData.createdBy = ObjectId(_id)
		bodyData.updatedBy = ObjectId(_id)
		try {
			const filter = { type: bodyData.type, value: bodyData.value }
			const entity = await userEntitiesData.findOneEntity(filter)

			if (entity) {
				return common.failureResponse({
					message: 'USER_ENTITY_ALREADY_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			let res = await userEntitiesData.createEntity(bodyData)
			const key = 'entity_' + bodyData.type
			await utils.internalDel(key)
			await KafkaProducer.clearInternalCache(key)
			return common.successResponse({
				statusCode: httpStatusCode.created,
				message: 'USER_ENTITY_CREATED_SUCCESSFULLY',
				result: res,
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * update entity
	 * @method
	 * @name create
	 * @param {Object} bodyData - entity information
	 * @param {string} _id - user id.
	 * @param {string} loggedInUserId - logged in user id.
	 * @returns {JSON} - returns updated entity information
	 */
	static async update(bodyData, _id, loggedInUserId) {
		bodyData.updatedBy = ObjectId(loggedInUserId)
		bodyData.updatedAt = new Date().getTime()
		try {
			const result = await userEntitiesData.updateOneEntity({ _id: ObjectId(_id) }, bodyData)
			if (result === 'ENTITY_ALREADY_EXISTS') {
				return common.failureResponse({
					message: 'USER_ENTITY_ALREADY_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			} else if (result === 'ENTITY_NOT_FOUND') {
				return common.failureResponse({
					message: 'USER_ENTITY_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			let key = ''
			if (bodyData.type) {
				key = 'entity_' + bodyData.type
				await utils.internalDel(key)
				await KafkaProducer.clearInternalCache(key)
			} else {
				const entities = await userEntitiesData.findOne(_id)
				key = 'entity_' + entities.type
				await utils.internalDel(key)
				await KafkaProducer.clearInternalCache(key)
			}
			return common.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'USER_ENTITY_UPDATED_SUCCESSFULLY',
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * read entity
	 * @method
	 * @name read
	 * @param {Object} bodyData - entity information
	 * @returns {JSON} - returns entity information
	 */
	static async read(bodyData) {
		const projection = { value: 1, label: 1, _id: 0 }
		if (!bodyData.deleted) {
			bodyData.deleted = false
		}
		try {
			const key = 'entity_' + bodyData.type
			let entities = (await utils.internalGet(key)) || false
			if (!entities) {
				entities = await userEntitiesData.findAllEntities(bodyData, projection)
				await utils.internalSet(key, entities)
			}
			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'USER_ENTITY_FETCHED_SUCCESSFULLY',
				result: entities,
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * delete entity
	 * @method
	 * @name delete
	 * @param {string} _id - user id.
	 * @param {string} loggedInUserId - logged in user id.
	 * @returns {JSON} - returns success of failure of deletion
	 */
	static async delete(_id) {
		try {
			const result = await userEntitiesData.updateOneEntity({ _id: ObjectId(_id) }, { deleted: true })
			if (result === 'ENTITY_ALREADY_EXISTS') {
				return common.failureResponse({
					message: 'USER_ENTITY_ALREADY_DELETED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			} else if (result === 'ENTITY_NOT_FOUND') {
				return common.failureResponse({
					message: 'USER_ENTITY_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			const entities = await userEntitiesData.findOne(_id)
			let key = 'entity_' + entities.type
			await utils.internalDel(key)
			await KafkaProducer.clearInternalCache(key)
			return common.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'USER_ENTITY_DELETED_SUCCESSFULLY',
			})
		} catch (error) {
			throw error
		}
	}
}
