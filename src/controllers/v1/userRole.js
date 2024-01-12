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
	 * Create roles.
	 * @method
	 * @name create
	 * @param {Object} req - Request data.
	 * @param {Object} req.body - Request body contains role creation details.
	 * @param {String} req.body.title - Title of the role.
	 * @param {Integer} req.body.userType - User type of the role.
	 * @param {String} req.body.status - Role status.
	 * @param {String} req.body.visibility - Visibility of the role.
	 * @param {Integer} req.body.organization_id - Organization ID for the role.
	 * @returns {JSON} - Response contains role creation details.
	 */

	async create(req) {
		try {
			const createRole = await roleService.create(req.body, req.decodedToken.organization_id)
			return createRole
		} catch (error) {
			return error
		}
	}

	/**
	 * Update roles.
	 * @method
	 * @name update
	 * @param {Object} req - Request data.
	 * @param {Object} req.body - Request body contains role update details.
	 * @param {String} req.body.title - Title of the role.
	 * @param {Integer} req.body.userType - User type of the role.
	 * @param {String} req.body.status - Role status.
	 * @param {String} req.body.visibility - Visibility of the role.
	 * @param {Integer} req.body.organization_id - Organization ID for the role.
	 * @returns {JSON} - Response contains role update details.
	 */

	async update(req) {
		try {
			const updateRole = await roleService.update(req.params.id, req.body, req.decodedToken.organization_id)
			return updateRole
		} catch (error) {
			return error
		}
	}

	/**
	 * Delete role.
	 * @method
	 * @name delete
	 * @param {Object} req - Request data.
	 * @returns {JSON} - Role deletion response.
	 */

	async delete(req) {
		try {
			return await roleService.delete(req.params.id, req.decodedToken.organization_id)
		} catch (error) {
			return error
		}
	}

	async list(req) {
		try {
			const roleList = await roleService.list(
				req.query,
				req.pageNo,
				req.pageSize,
				req.searchText,
				req.decodedToken.organization_id
			)
			return roleList
		} catch (error) {
			return error
		}
	}

	async default(req) {
		try {
			const defaultRoleList = await roleService.defaultList(req.query, req.pageNo, req.pageSize, req.searchText)
			return defaultRoleList
		} catch (error) {
			return error
		}
	}
}
