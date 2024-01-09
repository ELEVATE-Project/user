/**
 * @file session-manage.js
 * @description Controller for the session manager role.
 * @author Nevil
 * @created-date 02-Jan-2024
 */

// Dependencies
const sessionService = require('@services/sessions')

module.exports = class Sessions {
	/**
	 * Download the list of upcoming sessions by available mentors.
	 * @method
	 * @name downloadSessions
	 * @param {Object} req - Request data.
	 * @param {String} req.decodedToken.id - User Id.
	 * @param {Object} req.query - Request query params.
	 * @param {String} req.query.timezone - Timezone of the requesting user.
	 * @param {String} req.searchText - Search string.
	 * @returns {Buffer} - Binary file content.
	 * @throws {Error} - Throws an error if there's an issue during the download.
	 */
	async downloadSessions(req) {
		try {
			const sessionDetails = await sessionService.downloadList(
				req.decodedToken.id,
				req.query,
				req.query.timezone,
				req.searchText
			)
			return sessionDetails
		} catch (error) {
			throw error
		}
	}

	/**
	 * Get the list of sessions created by the session manager.
	 * @method
	 * @name createdSessions
	 * @param {Object} req - Request data.
	 * @param {String} req.decodedToken.id - User Id.
	 * @param {Object} req.query - Request query params.
	 * @param {String} req.query.timezone - Timezone of the requesting user.
	 * @param {Integer} req.pageNo - Page number.
	 * @param {Integer} req.pageSize - Limit.
	 * @param {String} req.searchText - Search string.
	 * @returns {Json} - List of sessions with count.
	 * @throws {Error} - Throws an error if there's an issue during session retrieval.
	 */
	async createdSessions(req) {
		try {
			const sessionDetails = await sessionService.createdSessions(
				req.decodedToken.id,
				req.query,
				req.query.timezone,
				req.pageNo,
				req.pageSize,
				req.searchText
			)
			return sessionDetails
		} catch (error) {
			throw error
		}
	}
}
