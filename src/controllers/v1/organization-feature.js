/**
 * name : organization-feature.js
 * author : Vishnu
 * created-date : 16-May-2025
 * Description : organization-feature Controller.
 */

// Dependencies
const organizationFeatureService = require('@services/organization-feature')
const common = require('@constants/common')
const responses = require('@helpers/responses')
const httpStatusCode = require('@generics/http-status')

module.exports = class OrganizationFeature {
	/**
	 * create organization feature
	 * @method
	 * @name create
	 * @param {Object} req -request data.
	 * @param {string} req.body - feature creation data.
	 * @returns {JSON} - returns the feature data
	 */
	async create(req) {
		try {
			//validate the user and tenant details
			const isAdmin = await organizationFeatureService.validateAndUpdateToken(req)
			const organizationFeature = await organizationFeatureService.create(req.body, req.decodedToken, isAdmin)
			return organizationFeature
		} catch (error) {
			return error
		}
	}

	/**
	 * update/delete organization feature
	 * @method
	 * @name update
	 * @param {Object} req -request data.
	 * @param {string} req.body - feature updation data.
	 * @returns {JSON} - returns the feature data
	 */
	async update(req) {
		try {
			//validate the user and tenant details
			await organizationFeatureService.validateAndUpdateToken(req)

			// Handle delete vs update operations
			return req.method === common.DELETE_METHOD
				? await organizationFeatureService.delete(req.params.id, req.decodedToken)
				: await organizationFeatureService.update(req.params.id, req.body, req.decodedToken)
		} catch (error) {
			return error
		}
	}

	/**
	 * read organization feature
	 * @method
	 * @name read
	 * @param {Object} req -request data.
	 * @returns {JSON} - returns the organization feature data
	 */
	async read(req) {
		try {
			// Admin header handling
			if (req.decodedToken.roles.includes(common.ADMIN_ROLE)) {
				const orgCode = req.header(common.ORGANIZATION_CODE)
				const tenantCode = req.header(common.TENANT_CODE)

				// assign correct values to correct properties
				if (orgCode) req.decodedToken.organization_code = orgCode
				if (tenantCode) req.decodedToken.tenant_code = tenantCode
			}

			if (!req.decodedToken.organization_code || !req.decodedToken.tenant_code) {
				throw responses.failureResponse({
					message: 'ORGANIZATION_CODE_OR_TENANT_CODE_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			return req.params.id
				? await organizationFeatureService.read(req.params.id, req.decodedToken)
				: await organizationFeatureService.list(req.decodedToken)
		} catch (error) {
			console.log(error, 'error')
			return error
		}
	}
}
