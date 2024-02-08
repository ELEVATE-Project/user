const common = require('@constants/common')
const rolePermissionService = require('@services/role-permission-mapping')

module.exports = class RolePermission {
	/**
	 * Create rolePermission.
	 * @method
	 * @name create
	 * @param {Object} req - Request data.
	 * @param {Integer} req.params.id - role_id
	 * @param {Integer} req.body.permission_id - permission_id
	 * @param {Integer} req.decodedToken.id - id
	 * @returns {JSON} - RolePermission creation object.
	 */

	async create(req) {
		try {
			const createRolePermission = await rolePermissionService.create(
				req.body.role_title,
				req.body.permission_id,
				req.decodedToken.id
			)
			return createRolePermission
		} catch (error) {
			return error
		}
	}

	/**
	 * Delete rolePermission.
	 * @method
	 * @name delete
	 * @param {Object} req - Request data.
	 * @param {Integer} req.params.id - role_id
	 * @param {Integer} req.body.permission_id - permission_id
	 * @returns {JSON} - RolePermission deletion object.
	 */

	async delete(req) {
		try {
			const deleteRolePermission = await rolePermissionService.delete(req.body.role_title, req.body.permission_id)
			return deleteRolePermission
		} catch (error) {
			return error
		}
	}

	/**
	 * list rolePermission.
	 * @method
	 * @name list
	 * @param {Integer} req.decodedToken.roles - roles
	 * @returns {JSON} - RolePermission list object.
	 */

	async list(req) {
		try {
			const roleTitle = req.decodedToken.roles.map(({ title }) => title)
			return await rolePermissionService.list(roleTitle)
		} catch (error) {
			return error
		}
	}
}
