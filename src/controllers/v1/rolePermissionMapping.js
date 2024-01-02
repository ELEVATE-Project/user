const common = require('@constants/common')
const RolePermissionService = require('@services/rolePermissionMapping')

module.exports = class RolePermission {
	/**
	 * Create rolePermission.
	 * @method
	 * @name create
	 * @param {Object} req - Request data.
	 * @returns {JSON} - RolePermission creation object.
	 */

	async create(req) {
		try {
			const createRolePermission = await RolePermissionService.create(req.params.id, req.body.permission_id)
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
	 * @returns {JSON} - RolePermission deletion object.
	 */

	async delete(req) {
		try {
			const deleteRolePermission = await RolePermissionService.delete(req.params.id, req.body.permission_id)
			return deleteRolePermission
		} catch (error) {
			return error
		}
	}
}
