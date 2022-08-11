const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const formsData = require('@db/forms/queries')
const utils = require('@generics/utils')
module.exports = class FormsHelper {
	/**
	 * Create Form.
	 * @method
	 * @name create
	 * @param {Object} bodyData
	 * @returns {JSON} - Form creation data.
	 */

	static async create(bodyData) {
		try {
			const form = await formsData.findOneForm(bodyData.type)
			if (form) {
				return common.failureResponse({
					message: 'FORM_ALREADY_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			await formsData.createForm(bodyData)
			await utils.internalDel('formVersion')

			return common.successResponse({
				statusCode: httpStatusCode.created,
				message: 'FORM_CREATED_SUCCESSFULLY',
			})
		} catch (error) {
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

	static async update(bodyData) {
		try {
			const checkVersion = await formsData.checkVersion(bodyData)
			if (checkVersion) {
				const result = await formsData.updateOneForm(bodyData)

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

				return common.successResponse({
					statusCode: httpStatusCode.accepted,
					message: 'FORM_UPDATED_SUCCESSFULLY',
				})
			} else {
				return common.failureResponse({
					message: 'UPDATE_FORM_VERSION',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
		} catch (error) {
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

	static async read(bodyData) {
		try {
			const form = await formsData.findOneForm(
				bodyData.type,
				bodyData.subType,
				bodyData.action,
				bodyData.templateName
			)

			if (!form) {
				return common.failureResponse({
					message: 'FORM_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'FORM_FETCHED_SUCCESSFULLY',
				result: form ? form : {},
			})
		} catch (error) {
			throw error
		}
	}
}
