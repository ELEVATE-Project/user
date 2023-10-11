/**
 * name : organization.js
 * author : Priyanka Pradeep
 * created-date : 24-July-2023
 * Description : Organization Controller.
 */

// Dependencies
const orgService = require('@services/helper/organization')
const utilsHelper = require('@generics/utils')
const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')

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
				isAdmin = utilsHelper.validateRoleAccess(roles, common.roleAdmin)
			}

			if (!isAdmin) {
				throw common.failureResponse({
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
			let isAdmin = false
			const roles = req.decodedToken.roles
			if (roles && roles.length > 0) {
				isAdmin = utilsHelper.validateRoleAccess(roles, common.roleAdmin)
			}

			if (!isAdmin) {
				throw common.failureResponse({
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
				req.query.organisationId ? req.query.organisationId : '',
				req.query.organisationCode ? req.query.organisationCode : ''
			)
			return result
		} catch (error) {
			return error
		}
	}
}
