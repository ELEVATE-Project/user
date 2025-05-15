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
			const tenant = await tenantService.read(req.params.id)
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
	 * @name userBulkUpload
	 * @param {Object} req -request data.
	 * @returns {JSON} - success or error message
	 */

	async userBulkUpload(req) {
		try {
			if (!utilsHelper.validateRoleAccess(req.decodedToken.roles, common.ADMIN_ROLE)) {
				throw responses.failureResponse({
					message: 'USER_IS_NOT_A_ADMIN',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const tenant = await tenantService.userBulkUpload(
				req.body.file_path,
				req.decodedToken.id,
				req.headers.organization,
				req.headers.tenant
			)
			return tenant
		} catch (error) {
			return error
		}
	}
}
