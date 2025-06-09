/**
 * name : feature.js
 * author : Priyanka Pradeep
 * created-date : 09-Jun-2025
 * Description : Feature controller
 */

const featureService = require('@services/feature')

module.exports = class feature {
	/**
	 * create or update feature
	 * @method
	 * @name update
	 * @param {Object} req - request data.
	 * @returns {JSON} - modules creation/updation object.
	 */

	async update(req) {
		try {
			let feature = {}
			if (req.params.id) {
				feature = await featureService.update(req.params.id, req.body, req.decodedToken.id)
			} else {
				feature = await featureService.create(req.body, req.decodedToken.id)
			}

			return feature
		} catch (error) {
			return error
		}
	}

	/**
	 * Get all available features
	 * @method
	 * @name list
	 * @param {String} req.pageNo - Page No.
	 * @param {String} req.pageSize - Page size limit.
	 * @param {String} req.searchText - Search text.
	 * @returns {JSON} - features List.
	 */

	async list(req) {
		try {
			const features = await featureService.list(req.pageNo, req.pageSize, req.searchText)
			return features
		} catch (error) {
			return error
		}
	}

	/**
	 * deletes features
	 * @method
	 * @name delete
	 * @param {Object} req - request data.
	 * @returns {JSON} - features deletion response.
	 */

	async delete(req) {
		try {
			const feature = await featureService.delete(req.params.id)
			return feature
		} catch (error) {
			return error
		}
	}
}
