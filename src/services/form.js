const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const utils = require('@generics/utils')
const form = require('@generics/form')
const KafkaProducer = require('@generics/kafka-communication')

const formQueries = require('../database/queries/form')
const { UniqueConstraintError } = require('sequelize')

const entityTypeQueries = require('../database/queries/entityType')
const { getDefaultOrgId } = require('@helpers/getDefaultOrgId')

module.exports = class FormsHelper {
	/**
	 * Create Form.
	 * @method
	 * @name create
	 * @param {Object} bodyData
	 * @returns {JSON} - Form creation data.
	 */

	static async create(bodyData, orgId) {
		try {
			bodyData['org_id'] = orgId
			const form = await formQueries.createForm(bodyData)

			await utils.internalDel('formVersion')

			await KafkaProducer.clearInternalCache('formVersion')

			return common.successResponse({
				statusCode: httpStatusCode.created,
				message: 'FORM_CREATED_SUCCESSFULLY',
				result: form,
			})
		} catch (error) {
			if (error instanceof UniqueConstraintError) {
				return common.failureResponse({
					message: 'FORM_ALREADY_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			throw error
		}
	}

	/**
	 * Update Form.
	 * @method
	 * @name update
	 * @param {Object} bodyData
	 * @returns {JSON} - Update form data.
	 */

	static async update(id, bodyData, orgId) {
		try {
			let filter = {}
			if (id) {
				filter = {
					id: id,
					org_id: orgId,
				}
			} else {
				filter = {
					type: bodyData.type,
					sub_type: bodyData.sub_type,
					org_id: orgId,
				}
			}
			bodyData['org_id'] = orgId
			const result = await formQueries.updateOneForm(filter, bodyData)

			if (result === 'ENTITY_ALREADY_EXISTS') {
				return common.failureResponse({
					message: 'FORM_ALREADY_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			} else if (result === 'ENTITY_NOT_FOUND') {
				return common.failureResponse({
					message: 'FORM_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			await utils.internalDel('formVersion')
			await KafkaProducer.clearInternalCache('formVersion')
			return common.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'FORM_UPDATED_SUCCESSFULLY',
			})
		} catch (error) {
			if (error instanceof UniqueConstraintError) {
				return common.failureResponse({
					message: 'FORM_ALREADY_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			throw error
		}
	}

	/**
	 * Read Form.
	 * @method
	 * @name read
	 * @param {Object} bodyData
	 * @returns {JSON} - Read form data.
	 */

	static async read(id, bodyData, orgId) {
		try {
			let filter = {}
			if (id) {
				filter = { id: id, org_id: orgId }
			} else {
				filter = { ...bodyData, org_id: orgId }
			}
			const form = await formQueries.findOneForm(filter)
			let defaultOrgForm
			if (!form) {
				const defaultOrgId = await getDefaultOrgId()
				if (!defaultOrgId)
					return common.failureResponse({
						message: 'DEFAULT_ORG_ID_NOT_SET',
						statusCode: httpStatusCode.bad_request,
						responseCode: 'CLIENT_ERROR',
					})
				filter = id ? { id: id, org_id: defaultOrgId } : { ...bodyData, org_id: defaultOrgId }
				defaultOrgForm = await formQueries.findOneForm(filter)
			}
			if (!form && !defaultOrgForm) {
				return common.failureResponse({
					message: 'FORM_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'FORM_FETCHED_SUCCESSFULLY',
				result: form ? form : defaultOrgForm,
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}
	static async readAllFormsVersion() {
		try {
			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'FORM_VERSION_FETCHED_SUCCESSFULLY',
				result: (await form.getAllFormsVersion()) || {},
			})
		} catch (error) {
			return error
		}
	}
}
