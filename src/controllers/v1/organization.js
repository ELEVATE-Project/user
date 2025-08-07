/**
 * name : organization.js
 * author : Priyanka Pradeep
 * created-date : 24-July-2023
 * Description : Organization Controller.
 */

// Dependencies
const utilsHelper = require('@generics/utils')
const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')
const orgService = require('@services/organization')
const responses = require('@helpers/responses')

module.exports = class Organization {
	/**
	 * create organization data
	 * @method
	 * @name create
	 * @param {Object} req -request data.
	 * @param {string} req.body.name -name of organization.
	 * @param {string} req.body.code -code for organization.
	 * @param {string} req.body.description -organization description.
	 * @param {string} req.body.data -organization data.
	 * @param {string} headers.internal_access_token - internal access token
	 * @returns {JSON} - returns the organization data
	 */

	async create(req) {
		try {
			let isAdmin = false
			const roles = req.decodedToken.roles
			if (roles && roles.length > 0) {
				isAdmin = utilsHelper.validateRoleAccess(roles, common.ADMIN_ROLE)
			}

			if (!isAdmin) {
				throw responses.failureResponse({
					message: 'USER_IS_NOT_A_ADMIN',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const createdOrg = await orgService.create(req.body, req.decodedToken.id)
			return createdOrg
		} catch (error) {
			return error
		}
	}

	/**
	 * update organization data
	 * @method
	 * @name update
	 * @param {Object} req -request data.
	 * @param {string} req.body.name -name of organization.
	 * @param {string} req.body.code -code for organization.
	 * @param {string} req.body.description -organization description.
	 * @param {string} req.body.data -organization data.
	 */

	async update(req) {
		try {
			let isAdmin,
				isOrgAdmin = false
			const roles = req.decodedToken.roles

			if (roles && roles.length > 0) {
				isAdmin = utilsHelper.validateRoleAccess(roles, common.ADMIN_ROLE)
				isOrgAdmin = utilsHelper.validateRoleAccess(roles, common.ORG_ADMIN_ROLE)
			}

			if (req.params.id != req.decodedToken.organization_id && isOrgAdmin) {
				if (req.body.related_orgs) {
					throw responses.failureResponse({
						message: 'CONTACT_ADMIN_RELATED_ORGANIZATIONS',
						statusCode: httpStatusCode.bad_request,
						responseCode: 'CLIENT_ERROR',
					})
				}
				throw responses.failureResponse({
					message: 'USER_DOES_NOT_HAVE_ACCESS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			} else if (!isAdmin && !isOrgAdmin) {
				throw responses.failureResponse({
					message: 'USER_IS_NOT_A_ADMIN',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const updatedOrg = await orgService.update(req.params.id, req.body, req.decodedToken.id)
			return updatedOrg
		} catch (error) {
			return error
		}
	}

	/**
	 * Organization List
	 * @method
	 * @name list
	 * @param {Object} req -request data with method POST.
	 * @param {Object} req.body -request body contains organization deatils.
	 * @param {Array} req.body.organizationIds -contains organizationIds.
	 * @returns {JSON} - all organization data
	 *
	 * @param {Object} req - request data with method GET.
	 * @param {Number} req.pageNo - page no.
	 * @param {Number} req.pageSize - page size limit.
	 * @param {String} req.searchText - search text.
	 * @returns {JSON} - List of user.
	 */
	async list(req) {
		try {
			const result = await orgService.list(req)
			return result
		} catch (error) {
			return error
		}
	}

	/**
	 * Request Org Role
	 * @method
	 * @name requestOrgRole
	 * @param {Object} req -request data.
	 * @param {string} req.body.role - requested role id.
	 * @param {string} req.body.form_data - answer for the form.
	 * @param {string} req.body.data -request data.
	 */

	async requestOrgRole(req) {
		try {
			const result = await orgService.requestOrgRole(req.decodedToken, req.body)
			return result
		} catch (error) {
			return error
		}
	}

	/**
	 * Organization read
	 * @method
	 * @name 					- read
	 * @param {Object} req 		- request data.
	 */

	async read(req) {
		try {
			const result = await orgService.read(
				req.query.organisation_id ? req.query.organisation_id : '',
				req.query.organisation_code ? req.query.organisation_code : '',
				req.query.tenant_code ? req.query.tenant_code : ''
			)
			return result
		} catch (error) {
			return error
		}
	}
	async details(req) {
		try {
			const roles = req.decodedToken.roles
			let isAdmin = false

			if (roles && roles.length > 0) {
				isAdmin =
					utilsHelper.validateRoleAccess(roles, common.ADMIN_ROLE) ||
					utilsHelper.validateRoleAccess(roles, common.ORG_ADMIN_ROLE) ||
					false
			}
			const result = await orgService.details(
				req.params.id ? req.params.id : '',
				req?.decodedToken?.id,
				req?.decodedToken?.tenant_code,
				isAdmin
			)
			return result
		} catch (error) {
			return error
		}
	}

	async addRelatedOrg(req) {
		try {
			const result = await orgService.addRelatedOrg(
				req.params.id ? req.params.id : '',
				req.body.related_orgs ? req.body.related_orgs : []
			)
			return result
		} catch (error) {
			return error
		}
	}
	async removeRelatedOrg(req) {
		try {
			const result = await orgService.removeRelatedOrg(
				req.params.id ? req.params.id : '',
				req.body.related_orgs ? req.body.related_orgs : []
			)
			return result
		} catch (error) {
			return error
		}
	}
	async addRegistrationCode(req) {
		try {
			const roles = req.decodedToken.roles
			let isAdmin = false
			let isOrgAdmin = false
			let tenantCode = null

			if (roles && roles.length > 0) {
				isAdmin = utilsHelper.validateRoleAccess(roles, common.ADMIN_ROLE)
				isOrgAdmin = utilsHelper.validateRoleAccess(roles, common.ORG_ADMIN_ROLE)
			}
			if (!isAdmin && !isOrgAdmin) {
				throw responses.failureResponse({
					message: 'USER_IS_NOT_A_ADMIN',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			if (isOrgAdmin) {
				tenantCode = req?.decodedToken?.tenant_code || null
			}

			if (isAdmin) {
				tenantCode = req?.body?.tenant_code || req?.decodedToken?.tenant_code || null
			}

			if (!tenantCode) {
				throw responses.failureResponse({
					message: 'TENANT_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const result = await orgService.addRegCode(
				req.params.id ? req.params.id : '', // org code
				tenantCode,
				req?.body?.registration_codes ? req.body.registration_codes : []
			)
			return result
		} catch (error) {
			return error
		}
	}
	async removeRegistrationCode(req) {
		try {
			const roles = req.decodedToken.roles
			let isAdmin = false
			let isOrgAdmin = false
			let tenantCode = null

			if (roles && roles.length > 0) {
				isAdmin = utilsHelper.validateRoleAccess(roles, common.ADMIN_ROLE)
				isOrgAdmin = utilsHelper.validateRoleAccess(roles, common.ORG_ADMIN_ROLE)
			}
			if (!isAdmin && !isOrgAdmin) {
				throw responses.failureResponse({
					message: 'USER_IS_NOT_A_ADMIN',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			if (isOrgAdmin) {
				tenantCode = req?.decodedToken?.tenant_code || null
			}

			if (isAdmin) {
				tenantCode = req?.body?.tenant_code || req?.decodedToken?.tenant_code || null
			}

			if (!tenantCode) {
				throw responses.failureResponse({
					message: 'TENANT_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const result = await orgService.removeRegCode(
				req.params.id ? req.params.id : '',
				tenantCode,
				req?.body?.registration_codes ? req.body.registration_codes : []
			)
			return result
		} catch (error) {
			return error
		}
	}
}
