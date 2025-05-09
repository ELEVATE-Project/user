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
	 * Updates user data
	 * @method
	 * @name update
	 * @param {Object} req -request data.
	 * @param {Object} req.body - contains user data.
	 * @returns {JSON} - user updated data.
	 */

	async update(req) {
		try {
			let tenant = {}
			const params = req?.body
			if (req.params.id) {
			} else {
				const domains = req?.body?.domains
				tenant = await tenantService.create(params, req.decodedToken.id, domains)
			}

			return tenant
		} catch (error) {
			return error
		}
	}
}
