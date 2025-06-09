/**
 * name : organization-feature.js
 * author : Vishnu
 * created-date : 16-May-2025
 * Description : organization-feature Controller.
 */

// Dependencies
const organizationFeatureService = require('@services/organization-feature')
const utilsHelper = require('@generics/utils')
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
			// check if user roles are admin or org admin
			if (!utilsHelper.validateRoleAccess(req.decodedToken.roles, [common.ADMIN_ROLE, common.ORG_ADMIN_ROLE])) {
				throw responses.failureResponse({
					message: 'USER_IS_NOT_A_ADMIN',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const isAdmin = req.decodedToken.roles.includes(common.ADMIN_ROLE)

			// if user is admin replace organization code & tenant code form header
			if (isAdmin) {
				const orgCode = req.header(common.ORGANIZATION_CODE)
				const tenantCode = req.header(common.TENANT_CODE)

				// assign correct values to correct properties
				if (orgCode) req.decodedToken.organization_code = orgCode
				if (tenantCode) req.decodedToken.tenant_code = tenantCode

				// Fixed: use the actual header values
				req.decodedToken.organization_code = orgCode
				req.decodedToken.tenant_code = tenantCode
			}

			if (!req.decodedToken.organization_code || !req.decodedToken.tenant_code) {
				throw responses.failureResponse({
					message: 'ORGANIZATION_CODE_OR_TENANT_CODE_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const organizationFeature = await organizationFeatureService.create(req.body, req.decodedToken)
			return organizationFeature
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
			// check if user roles are admin or org admin
			if (!utilsHelper.validateRoleAccess(req.decodedToken.roles, [common.ADMIN_ROLE, common.ORG_ADMIN_ROLE])) {
				throw responses.failureResponse({
					message: 'USER_IS_NOT_A_ADMIN',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			// if user is admin replace organization code & tenant code form heade
			if (req.decodedToken.roles.includes(common.ADMIN_ROLE)) {
				const orgCode = req.header(common.ORGANIZATION_CODE)
				const tenantCode = req.header(common.TENANT_CODE)

				if (!orgCode || !tenantCode) {
					throw responses.failureResponse({
						message: 'ORGANIZATION_CODE_OR_TENANT_CODE_NOT_FOUND',
						statusCode: httpStatusCode.bad_request,
						responseCode: 'CLIENT_ERROR',
					})
				}

				// Fixed: use the actual header values
				req.decodedToken.organization_code = orgCode
				req.decodedToken.tenant_code = tenantCode
			}

			// Handle delete vs update operations
			return req.method === common.DELETE_METHOD
				? await organizationFeatureService.delete(req.params.id, req.decodedToken)
				: await organizationFeatureService.update(req.body, req.decodedToken, true)
		} catch (error) {
			return error
		}
	}
}
