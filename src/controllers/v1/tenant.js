/**
 * name : tenant.js
 * author : Adithya Dinesh
 * created-date : 07-May-2025
 * Description : Tenant controller.
 */

// Dependencies
const tenantService = require('@services/tenant')
const utilsHelper = require('@generics/utils')
const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')
const responses = require('@helpers/responses')
module.exports = class Tenant {
	/**
	 * Updates tenant data
	 * @method
	 * @name update
	 * @param {Object} req -request data.
	 * @returns {JSON} - tenant updated data.
	 */

	async update(req) {
		try {
			let tenant = {}
			const params = req?.body
			if (req.params.id) {
				tenant = await tenantService.update(req.params.id, params, req.decodedToken.id)
			} else {
				const domains = req?.body?.domains
				tenant = await tenantService.create(params, req.decodedToken.id, domains)
			}

			return tenant
		} catch (error) {
			return error
		}
	}

	/**
	 * Add new domain to tenant
	 * @method
	 * @name addDomain
	 * @param {Object} req -request data.
	 * @returns {JSON} - success or error message
	 */

	async addDomain(req) {
		try {
			const domains = req?.body?.domains
			const tenant = await tenantService.addDomain(req.params.id, domains)

			return tenant
		} catch (error) {
			return error
		}
	}

	/**
	 * Remove domain from tenant
	 * @method
	 * @name removeDomain
	 * @param {Object} req -request data.
	 * @returns {JSON} - success or error message
	 */

	async removeDomain(req) {
		try {
			const domains = req?.body?.domains
			const tenant = await tenantService.removeDomain(req.params.id, domains, req.decodedToken.id)
			return tenant
		} catch (error) {
			return error
		}
	}

	/**
	 * Read tenant details
	 * @method GET
	 * @name read
	 * @param {Object} req -request data.
	 * @returns {JSON} - success or error message
	 */

	async read(req) {
		try {
			let code = req?.decodedToken?.tenant_code
			let isAdmin = true

			if (!req?.decodedToken?.roles) {
				return responses.failureResponse({
					statusCode: httpStatusCode.bad_request,
					message: 'PERMISSION_DENIED',
					result: {},
				})
			}
			// only admin can query any tenants in the system
			if (!utilsHelper.validateRoleAccess(req.decodedToken.roles, common.ADMIN_ROLE)) {
				// normal user can query only tenant details of their own tenant
				if (req?.params?.id && req.decodedToken.tenant_code != req.params.id) {
					return responses.failureResponse({
						statusCode: httpStatusCode.bad_request,
						message: 'PERMISSION_DENIED',
						result: {},
					})
				}

				code = req.decodedToken.tenant_code
				isAdmin = false
			} else {
				code = req?.params?.id
			}
			const tenant = await tenantService.read(code, isAdmin)
			return tenant
		} catch (error) {
			return error
		}
	}

	/**
	 * List tenants
	 * @method GET
	 * @name read
	 * @param {Object} req -request data.
	 * @returns {JSON} - success or error message
	 */

	async list(req) {
		try {
			const tenant = await tenantService.list(req.pageNo, req.pageSize, req.searchText)
			return tenant
		} catch (error) {
			return error
		}
	}
	/**
	 * List tenants
	 * @method POST
	 * @name bulkUserCreate
	 * @param {Object} req -request data.
	 * @returns {JSON} - success or error message
	 */

	async bulkUserCreate(req) {
		try {
			const tenant = await tenantService.userBulkUpload(
				req.body.file_path,
				req.decodedToken.id,
				req.headers?.[process.env.ORG_CODE_HEADER_NAME],
				req.headers?.[process.env.TENANT_CODE_HEADER_NAME],
				req?.body?.editable_fields,
				req?.body?.upload_type.toUpperCase()
			)
			return tenant
		} catch (error) {
			return error
		}
	}

	/**
	 * Read tenant details for internal service calls
	 * @method
	 * @name readInternal
	 * @param {Object} req - request data
	 * @param {String} req.params.id - tenant code to fetch details for
	 * @returns {JSON} - tenant details without any filtering for internal service use
	 */

	async readInternal(req) {
		try {
			const tenantCode = req.params.id
			if (!tenantCode) {
				return responses.failureResponse({
					statusCode: httpStatusCode.bad_request,
					message: 'TENANT_CODE_REQUIRED',
					result: {},
				})
			}
			const tenant = await tenantService.read(tenantCode, true)
			return tenant
		} catch (error) {
			return error
		}
	}
}
