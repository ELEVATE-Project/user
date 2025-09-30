/**
 * name : userRole.js
 * author : Priyanka Pradeep
 * created-date : 21-Jun-2023
 * Description : User roles
 */

// Dependencies
const roleService = require('@services/user-role')

module.exports = class userRole {
	/**
	 * Create a new role.
	 * @method
	 * @name create
	 * @param {Object} req - Request object.
	 * @param {Object} req.body - Request body containing role details.
	 * @param {String} req.body.title - Title of the role.
	 * @param {Number} req.body.userType - User type for the role.
	 * @param {String} req.body.status - Role status.
	 * @param {String} req.body.visibility - Role visibility.
	 * @param {String} req.body.translations - Role translations.
	 * @param {Number} req.body.organization_id - Organization ID.
	 * @param {Object} req.decodedToken - Authenticated user token.
	 * @returns {Object} - Created role details.
	 */

	async create(req) {
		try {
			const createRole = await roleService.create(
				req.body,
				req.decodedToken.organization_id,
				req.decodedToken.tenant_code
			)
			return createRole
		} catch (error) {
			return error
		}
	}

	/**
	 * Update a role.
	 * @method
	 * @name update
	 * @param {Object} req - Request object.
	 * @param {Object} req.body - Request body containing updated role details.
	 * @param {String} req.body.title - Title of the role.
	 * @param {Number} req.body.userType - User type for the role.
	 * @param {String} req.body.status - Role status.
	 * @param {String} req.body.visibility - Role visibility.
	 * @param {String} req.body.translations - Role translations.
	 * @param {Number} req.body.organization_id - Organization ID.
	 * @param {String} req.params.id - Role ID to be updated.
	 * @param {Object} req.decodedToken - Authenticated user token.
	 * @returns {Object} - Updated role details.
	 */

	async update(req) {
		try {
			const updateRole = await roleService.update(
				req.params.id,
				req.body,
				req.decodedToken.organization_id,
				req.decodedToken.organization_code,
				req.decodedToken.tenant_code
			)
			return updateRole
		} catch (error) {
			return error
		}
	}

	/**
	 * Delete a role.
	 * @method
	 * @name delete
	 * @param {Object} req - Request object.
	 * @param {String} req.params.id - Role ID to be deleted.
	 * @param {Object} req.decodedToken - Authenticated user token.
	 * @returns {Object} - Deletion response.
	 */
	async delete(req) {
		try {
			return await roleService.delete(
				req.params.id,
				req.decodedToken.organization_id,
				req.decodedToken.organization_code,
				req.decodedToken.tenant_code
			)
		} catch (error) {
			return error
		}
	}

	/**
	 * Get a paginated list of roles with optional filters and search.
	 * @method
	 * @name list
	 * @param {Object} req - Request object.
	 * @param {Object} req.query - Query parameters.
	 * @param {Array<String>} [req.query.filters] - Filters.
	 * @param {String} [req.query.language] - Language code.
	 * @param {String} req.pageNo - Page number.
	 * @param {String} req.pageSize - Page size limit.
	 * @param {String} req.searchText - Search text.
	 * @param {Object} req.decodedToken - Authenticated user token.
	 * @returns {Object} - List of roles.
	 */
	async list(req) {
		try {
			const roleList = await roleService.list(
				req.query,
				req.pageNo,
				req.pageSize,
				req.searchText,
				req.decodedToken.organization_id,
				req.decodedToken.tenant_code,
				req.query.language || ''
			)
			return roleList
		} catch (error) {
			return error
		}
	}

	/**
	 * @deprecated
	 * This method is deprecated. Use `list()` instead.
	 * @method
	 * @name default
	 * @param {Object} req - Request object.
	 * @param {Array<String>} req.body.filters - Filters.
	 * @param {String} req.pageNo - Page number.
	 * @param {String} req.pageSize - Page size limit.
	 * @param {String} req.searchText - Search text.
	 * @returns {Object} - List of roles.
	 */
	/* 
	async default(req) {
		try {
			const defaultRoleList = await roleService.defaultList(
				req.query, 
				req.pageNo, 
				req.pageSize, 
				req.searchText
			)
			return defaultRoleList
		} catch (error) {
			return error
		}
	}
	*/
}
