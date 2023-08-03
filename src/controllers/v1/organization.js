/**
 * name : organization.js
 * author : Priyanka Pradeep
 * created-date : 24-July-2023
 * Description : Organization Controller.
 */

// Dependencies
const orgHelper = require('@services/helper/organization')

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
	 * @returns {JSON} - returns the organization data
	 */

	async create(req) {
		try {
			const createdOrg = await orgHelper.create(req.body)
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
			const updatedOrg = await orgHelper.update(req.params.id, req.body)
			return updatedOrg
		} catch (error) {
			return error
		}
	}
}
