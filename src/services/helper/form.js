const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const formsData = require('@db/forms/queries')
const { InternalCache } = require('elevate-node-cache')

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
			let formVersionCached = await InternalCache.getKey('formsversion')
			formVersionCached = formVersionCached ? formVersionCached : {}
			formVersionCached[bodyData.type] = bodyData.ver
			await InternalCache.setKey('formsversion', formVersionCached, common.internalCacheExpirationTime)
			return common.successResponse({
				statusCode: httpStatusCode.created,
				message: 'FORM_CREATED_SUCCESSFULLY',
				meta: formVersionCached,
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
			console.log(checkVersion)
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

				return common.successResponse({
					statusCode: httpStatusCode.accepted,
					message: 'FORM_UPDATED_SUCCESSFULLY',
				})
			} else {
				return common.failureResponse({
					message: 'FORM_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERRORhh',
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
			const key = bodyData.type + bodyData.subType + bodyData.action + bodyData.ver + bodyData.templateName
			let form = {}
			if (await InternalCache.getKey(key)) {
				form = JSON.parse(await InternalCache.getKey(key))
			} else {
				form = await formsData.findOneForm(
					bodyData.type,
					bodyData.subType,
					bodyData.action,
					bodyData.ver,
					bodyData.templateName
				)
				await InternalCache.setKey(key, JSON.stringify(form))
			}
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
