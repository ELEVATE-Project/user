/**
 * name : organization.js
 * author : Priyanka Pradeep
 * created-date : 24-July-2023
 * Description : Organization Controller.
 */

// Dependencies
const orgService = require('@services/organization')

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
			const createdOrg = await orgService.create(req.body)
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
			const updatedOrg = await orgService.update(req.params.id, req.body)
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
}
