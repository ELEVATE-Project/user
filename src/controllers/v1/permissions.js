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
		const params = req.body
		const role = req.decodedToken.roles
		try {
			const createdPermissions = await permissionsService.create(params)
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
		const params = req.body
		const id = req.params.id
		const role = req.decodedToken.roles
		try {
			const updatedPermissions = await permissionsService.update(id, params)
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
			const page = req.pageNo
			const limit = req.pageSize
			const search = req.searchText
			const PermissionsDetails = await permissionsService.list(page, limit, search)
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
		const role = req.decodedToken.roles
		const id = req.params.id
		try {
			const permissionsDelete = await permissionsService.delete(id)
			return permissionsDelete
		} catch (error) {
			return error
		}
	}
}
