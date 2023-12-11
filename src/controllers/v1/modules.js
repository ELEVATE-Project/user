const common = require('@constants/common')
const modulesService = require('@services/modules')

module.exports = class modules {
	/**
	 * create modules
	 * @method
	 * @name create
	 * @param {Object} req - request data.
	 * @returns {JSON} - modules creation object.
	 */

	async create(req) {
		const params = req.body
		try {
			const createdModules = await modulesService.create(params)
			return createdModules
		} catch (error) {
			return error
		}
	}

	/**
	 * updates modules
	 * @method
	 * @name update
	 * @param {Object} req - request data.
	 * @returns {JSON} - modules updation response.
	 */

	async update(req) {
		const params = req.body
		const id = req.params.id
		try {
			const updatedModules = await modulesService.update(id, params)
			return updatedModules
		} catch (error) {
			return error
		}
	}

	/**
	 * Get all available modules
	 * @method
	 * @name list
	 * @param {String} req.pageNo - Page No.
	 * @param {String} req.pageSize - Page size limit.
	 * @param {String} req.searchText - Search text.
	 * @returns {JSON} - modules List.
	 */

	async list(req) {
		try {
			const page = req.pageNo
			const limit = req.pageSize
			const search = req.searchText
			const modulesDetails = await modulesService.list(page, limit, search)
			return modulesDetails
		} catch (error) {
			return error
		}
	}

	/**
	 * deletes modules
	 * @method
	 * @name delete
	 * @param {Object} req - request data.
	 * @returns {JSON} - modules deletion response.
	 */

	async delete(req) {
		const id = req.params.id
		try {
			const modulesDelete = await modulesService.delete(id)
			return modulesDelete
		} catch (error) {
			return error
		}
	}
}
