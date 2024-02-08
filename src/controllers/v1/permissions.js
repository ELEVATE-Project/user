const common = require('@constants/common')
const permissionsService = require('@services/permissions')

module.exports = class permissions {
	/**
	 * create permissions
	 * @method
	 * @name create
	 * @param {Object} req - request data.
	 * @returns {JSON} - permissions creation object.
	 */

	async create(req) {
		try {
			const createdPermissions = await permissionsService.create(req.body)
			return createdPermissions
		} catch (error) {
			return error
		}
	}

	/**
	 * updates permissions
	 * @method
	 * @name update
	 * @param {Object} req - request data.
	 * @returns {JSON} - permissions updation response.
	 */

	async update(req) {
		try {
			const updatedPermissions = await permissionsService.update(req.params.id, req.body)
			return updatedPermissions
		} catch (error) {
			return error
		}
	}

	/**
	 * Get all available permissions
	 * @method
	 * @name list
	 * @param {String} req.pageNo - Page No.
	 * @param {String} req.pageSize - Page size limit.
	 * @param {String} req.searchText - Search text.
	 * @returns {JSON} - Permissions List.
	 */

	async list(req) {
		try {
			const PermissionsDetails = await permissionsService.list(req.pageNo, req.pageSize, req.searchText)
			return PermissionsDetails
		} catch (error) {
			return error
		}
	}

	/**
	 * deletes permissions
	 * @method
	 * @name delete
	 * @param {Object} req - request data.
	 * @returns {JSON} - permissions deletion response.
	 */

	async delete(req) {
		try {
			const permissionsDelete = await permissionsService.delete(req.params.id)
			return permissionsDelete
		} catch (error) {
			return error
		}
	}
}
