const issuesHelper = require('@services/helper/issues')

module.exports = class Help {
	/**
	 * Report an issue
	 * @method
	 * @name create
	 * @param {Object} req -request data.
	 * @param {string} req.body.description - Issue description.
	 * @returns {JSON} - returns success response.
	 */

	async create(req) {
		const params = req.body
		try {
			const createdIssue = await issuesHelper.create(params, req.decodedToken)
			return createdIssue
		} catch (error) {
			return error
		}
	}
}
