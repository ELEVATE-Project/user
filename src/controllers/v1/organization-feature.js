/**
 * name : organization-feature.js
 * author : Vishnu
 * created-date : 16-May-2025
 * Description : organization-feature Controller.
 */

// Dependencies
const organizationFetureService = require('@services/organization-feature')
const utilsHelper = require('@generics/utils')
const common = require('@constants/common')

module.exports = class OrganizationFeature {
	/**
	 * create organization feature
	 * @method
	 * @name template
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
			// if user is admin check for organization code & tenant code form header
			if (req.decodedToken.roles.includes(common.ADMIN_ROLE)) {
				if (!req.header('organizationcode') || !req.header('tenantcode')) {
					throw responses.failureResponse({
						message: 'ORGANIZATION_CODE_OR_TENANT_CODE_NOT_FOUND',
						statusCode: httpStatusCode.bad_request,
						responseCode: 'CLIENT_ERROR',
					})
				}

				// set organization code & tenant code in decoded token
				req.decodedToken.tenant_code = req.header('tenantcode')
				req.decodedToken.organization_code = req.header('organizationcode')
			}
			const organizationFeature = await organizationFetureService.create(req.body, req.decodedToken, true)
			return organizationFeature
		} catch (error) {
			return error
		}
	}
}
