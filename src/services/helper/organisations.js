/**
 * name : services/helper/Organisation.js
 * author : Rakesh Kumar
 * created-date :13-01-2023
 * Description : organisation reltaed information.
 */

// Dependencies
const ObjectId = require('mongoose').Types.ObjectId
const KafkaProducer = require('@generics/kafka-communication')
const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const organisationData = require('@db/organisations/query')
const utils = require('@generics/utils')

module.exports = class OrganisationHelper {
	/**
	 * create organisation
	 * @method
	 * @name create
	 * @param {Object} bodyData - organisation information
	 * @param {string} bodyData.code - organisation code.
	 * @param {string} bodyData.name - organisation name.
	 * @returns {JSON} - returns created organisation information
	 */
	static async create(bodyData, _id) {
		bodyData.createdBy = ObjectId(_id)
		bodyData.updatedBy = ObjectId(_id)
		try {
			const filter = { code: bodyData.code }
			const organisation = await organisationData.findOneOrganisation(filter)

			if (organisation) {
				return common.failureResponse({
					message: 'ORGANISATION_ALREADY_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			let res = await organisationData.create(bodyData)
			const key = 'ORGANISATION_' + res._id
			await utils.internalDel(key)
			await KafkaProducer.clearInternalCache(key)
			return common.successResponse({
				statusCode: httpStatusCode.created,
				message: 'ORGANISATION_CREATED_SUCCESSFULLY',
				result: res,
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * update organisation
	 * @method
	 * @name create
	 * @param {Object} bodyData - organisation information
	 * @param {string} _id - organisation id.
	 * @param {string} loggedInUserId - logged in user id.
	 * @returns {JSON} - returns updated organisation information
	 */
	static async update(bodyData, _id, loggedInUserId) {
		bodyData.updatedBy = ObjectId(loggedInUserId)
		bodyData.updatedAt = new Date().getTime()
		try {
			const filter = { code: bodyData.code, _id: { $ne: ObjectId(_id) } }
			const orgCodeFound = await organisationData.findOneOrganisation(filter)

			if (orgCodeFound) {
				return common.failureResponse({
					message: 'ORGANISATION_ALREADY_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const result = await organisationData.updateOne({ _id: ObjectId(_id) }, bodyData)
			if (result === 'ORGANISATION_ALREADY_EXISTS') {
				return common.failureResponse({
					message: 'ORGANISATION_ALREADY_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			} else if (result === 'ORGANISATION_NOT_FOUND') {
				return common.failureResponse({
					message: 'ORGANISATION_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			let key = ''
			if (_id) {
				key = 'ORGANISATION_' + _id
				await utils.internalDel(key)
				await KafkaProducer.clearInternalCache(key)
			} else {
				const organisation = await organisationData.findOne(_id)
				key = 'ORGANISATION_' + _id
				await utils.internalDel(key)
				await KafkaProducer.clearInternalCache(key)
			}
			return common.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'ORGANISATION_UPDATED_SUCCESSFULLY',
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * read organisation
	 * @method
	 * @name read
	 * @param {Object} bodyData - organisation information
	 * @returns {JSON} - returns organisation information
	 */
	static async read(organisationId) {
		try {
			const key = 'ORGANISATION_' + organisationId
			let organisation = (await utils.internalGet(key)) || false

			if (!organisation) {
				organisation = await organisationData.findOneOrganisation({ _id: organisationId, deleted: false })

				await utils.internalSet(key, organisation)
			}
			if (organisation) {
				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'ORGANISATION_FETCHED_SUCCESSFULLY',
					result: organisation,
				})
			} else {
				return common.failureResponse({
					message: 'ORGANISATION_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
		} catch (error) {
			throw error
		}
	}

	/**
	 * delete organisation
	 * @method
	 * @name delete
	 * @param {string} _id - user id.
	 * @param {string} loggedInUserId - logged in user id.
	 * @returns {JSON} - returns success of failure of deletion
	 */
	static async delete(_id) {
		try {
			const result = await organisationData.updateOne({ _id: ObjectId(_id) }, { deleted: true })
			if (result === 'ORGANISATION_ALREADY_EXISTS') {
				return common.failureResponse({
					message: 'ORGANISATION_ALREADY_DELETED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			} else if (result === 'ORGANISATION_NOT_FOUND') {
				return common.failureResponse({
					message: 'ORGANISATION_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			let key = 'ORGANISATION_' + _id
			await utils.internalDel(key)
			await KafkaProducer.clearInternalCache(key)
			return common.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'ORGANISATION_DELETED_SUCCESSFULLY',
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * Organisation list.
	 * @method
	 * @name list
	 * @param {Number} page - page no.
	 * @param {Number} limit - page size.
	 * @param {String} search - search text.
	 * @returns {JSON} - List of sessions
	 */
	static async list(page, limit, search) {
		try {
			const organisations = await organisationData.findAllOrganisations(page, limit, search, {})
			console.log('organisations', organisations)
			if (organisations[0] && organisations[0].data.length == 0 && search !== '') {
				return common.failureResponse({
					message: 'ORGANISATION_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
					result: [],
				})
			}

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'ORGANISATION_FETCHED_SUCCESSFULLY',
				result: organisations[0] ? organisations[0] : [],
			})
		} catch (error) {
			throw error
		}
	}
}
