/**
 * name : tenant.js
 * author : Adithya Dinesh
 * created-date : 07-May-2025
 * Description : Tenant controller.
 */

// Dependencies
const tenantService = require('@services/tenant')

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
}
