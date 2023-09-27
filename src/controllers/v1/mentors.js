/**
 * name : mentors.js
 * author : Aman
 * created-date : 10-Nov-2021
 * Description : User mentors
 */

// Dependencies
const mentorsService = require('@services/mentors')
module.exports = class Mentors {
	/**
	 * List of mentors
	 * @method
	 * @name list
	 * @param {Object} req -request data.
	 * @param {string} req.pageNo -page number.
	 * @param {string} req.pageSize -request data.
	 * @param {string} req.searchText - search text.
	 * @returns {Array} - Mentors
	 */

	async list(req) {
		const userId = req.decodedToken._id
		try {
			const mentors = await mentorsService.list(req.pageNo, req.pageSize, req.searchText, userId, req.query.match)
			return mentors
		} catch (error) {
			return error
		}
	}
}
