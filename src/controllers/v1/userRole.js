/**
 * name : userRole.js
 * author : Priyanka Pradeep
 * created-date : 21-Jun-2023
 * Description : User roles
 */

// Dependencies
const roleService = require('@services/userRole')

module.exports = class userRole {
	/**
	 * create roles
	 * @method
	 * @name create
	 * @param {Object} req -request data.
	 * @param {Object} req.body -request body contains role creation deatils.
	 * @param {String} req.body.title - title of the role.
	 * @param {Integer} req.body.userType - userType role .
	 * @param {String} req.body.status - role status.
	 * @param {String} req.body.visibility - visibility of the role.
	 * @param {Integer} req.body.organization_id - organization for role.
	 * @returns {JSON} - response contains role creation details.
	 */

	async create(req) {
		try {
			const createRole = await roleService.create(req.body)
			return createRole
		} catch (error) {
			return error
		}
	}

	/**
	 * update roles
	 * @method
	 * @name update
	 * @param {Object} req -request data.
	 * @param {Object} req.body -request body contains role updation details.
	 * @param {String} req.body.title - title of the role.
	 * @param {Integer} req.body.userType - userType role .
	 * @param {String} req.body.status - role status.
	 * @param {String} req.body.visibility - visibility of the role.
	 * @param {Integer} req.body.organization_id - organization for role.
	 * @returns {JSON} - response contains role updation details.
	 */

	async update(req) {
		try {
			const updateRole = await roleService.update(req.params.id, req.body)
			return updateRole
		} catch (error) {
			return error
		}
	}

	/**
	 * deletes role
	 * @method
	 * @name delete
	 * @param {Object} req - request data.
	 * @returns {JSON} - role deletion response.
	 */

	async delete(req) {
		try {
			return await roleService.delete(req.params.id)
		} catch (error) {
			return error
		}
	}

	/**
	 * Get all available roles
	 * @method
	 * @name list
	 * @param {String} req.pageNo - Page No.
	 * @param {String} req.pageSize - Page size limit.
	 * @param {String} req.searchText - Search text.
	 * @returns {JSON} - role List.
	 */

	async list(req) {
		try {
			const roleList = await roleService.list(req.body.filters, req.pageNo, req.pageSize, req.searchText)
			return roleList
		} catch (error) {
			return error
		}
	}
}
