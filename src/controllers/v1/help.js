const helpHelper = require('@services/helper/help')

module.exports = class Help {
	/**
	 * Report an issue
	 * @method
	 * @name create
	 * @param {Object} req -request data.
	 * @param {string} req.body.description - Issue description.
	 * @returns {JSON} - returns success response.
	 */

	async report(req) {
		const params = req.body
		try {
			const reportedIssue = await helpHelper.report(params, req.decodedToken)
			return reportedIssue
		} catch (error) {
			return error
		}
	}
}
