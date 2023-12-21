/**
 * name : mentees.js
 * author : Aman
 * created-date : 12-Oct-2021
 * Description : Mentees.
 */

// Dependencies
const { isAMentor } = require('@generics/utils')
const menteesService = require('@services/mentees')

module.exports = class Mentees {
	/**
	 * mentees profile
	 * @method
	 * @name profile
	 * @param {Object} req - request data.
	 * @param {String} req.decodedToken.id - User Id.
	 * @returns {JSON} - Mentee profile details
	 */
	/* async profile(req) {
		try {
			return await menteesHelper.profile(req.decodedToken.id)
		} catch (error) {
			return errors
		}
	} */
	/**
	 * mentees sessions
	 * @method
	 * @name sessions
	 * @param {Object} req - request data.
	 * @param {String} req.decodedToken.id - User Id.
	 * @param {Boolean} req.query.enrolled - Enrolled key true/false.
	 * @param {Number} req.pageNo - page no.
	 * @param {Number} req.pageSize - page size limit.
	 * @param {String} req.searchText - search text.
	 * @returns {JSON} - List of mentees sessions. Include all and my sessions.
	 */

	async sessions(req) {
		try {
			const sessions = await menteesService.sessions(
				req.decodedToken.id,
				req.pageNo,
				req.pageSize,
				req.searchText
			)
			return sessions
		} catch (error) {
			return error
		}
	}

	/**
	 * Mentees reports
	 * @method
	 * @name reports
	 * @param {Object} req - request data.
	 * @param {String} req.decodedToken.id - User Id.
	 * @param {String} req.query.filterType - filterType.
	 * @param {String} [req.query.filterType = "MONTHLY"] - Monthly reports.
	 * @param {String} [req.query.filterType = "WEEKLY"] - Weekly report.
	 * @param {String} [req.query.filterType = "QUARTERLY"] - Quarterly report.
	 * @returns {JSON} - Mentees reports.
	 */

	async reports(req) {
		try {
			const reports = await menteesService.reports(req.decodedToken.id, req.query.filterType)
			return reports
		} catch (error) {
			return error
		}
	}

	/**
	 * Mentees home feed API.
	 * @method
	 * @name homeFeed
	 * @param {Object} req - request data.
	 * @param {String} req.decodedToken.id - User Id.
	 * @param {Boolean} req.decodedToken.isAMentor - true/false.
	 * @returns {JSON} - Mentees home feed response.
	 */

	async homeFeed(req) {
		try {
			const homeFeed = await menteesService.homeFeed(
				req.decodedToken.id,
				isAMentor(req.decodedToken.roles),
				req.pageNo,
				req.pageSize,
				req.searchText,
				req.query
			)
			return homeFeed
		} catch (error) {
			return error
		}
	}

	/**
	 * Join Mentees session.
	 * @method
	 * @name joinSession
	 * @param {Object} req - request data.
	 * @param {String} req.params.id - Session id.
	 * @param {String} req.decodedToken.token - Mentees token.
	 * @returns {JSON} - Mentees join session link.
	 */

	async joinSession(req) {
		try {
			const session = await menteesService.joinSession(req.params.id, req.decodedToken.token)
			return session
		} catch (error) {
			return error
		}
	}

	// To be removed later
	// /**
	//  * Create a new mentee extension.
	//  * @method
	//  * @name createMenteeExtension
	//  * @param {Object} req - Request data.
	//  * @param {Object} req.body - Mentee extension data excluding userid.
	//  * @returns {Promise<Object>} - Created mentee extension details.
	//  */
	// async create(req) {
	// 	try {
	// 		return await menteesHelper.createMenteeExtension(req.body, req.decodedToken.id)
	// 	} catch (error) {
	// 		console.error(error)
	// 		return error
	// 	}
	// }

	// /**
	//  * Update a mentee extension.
	//  * @method
	//  * @name updateMenteeExtension
	//  * @param {Object} req - Request data.
	//  * @param {String} req.decodedToken.id - User ID of the mentee.
	//  * @param {Object} req.body - Updated mentee extension data excluding userid.
	//  * @returns {Promise<Object>} - Updated mentee extension details.
	//  */
	// async update(req) {
	// 	try {
	// 		return await menteesHelper.updateMenteeExtension(req.body, req.decodedToken.id)
	// 	} catch (error) {
	// 		return error
	// 	}
	// }

	// /**
	//  * Get mentee extension by user ID.
	//  * @method
	//  * @name getMenteeExtension
	//  * @param {Object} req - Request data.
	//  * @param {String} req.params.id - User ID of the mentee.
	//  * @returns {Promise<Object>} - Mentee extension details.
	//  */
	// async getMenteeExtension(req) {
	// 	try {
	// 		return await menteesHelper.getMenteeExtension(req.query.id || req.decodedToken.id) // params since read will be public for mentees
	// 	} catch (error) {
	// 		return error
	// 	}
	// }

	// /**
	//  * Delete a mentee extension by user ID.
	//  * @method
	//  * @name deleteMenteeExtension
	//  * @param {Object} req - Request data.
	//  * @param {String} req.decodedToken.id - User ID of the mentee.
	//  * @returns {Promise<Boolean>} - True if deleted successfully, otherwise false.
	//  */
	// async deleteMenteeExtension(req) {
	// 	try {
	// 		return await menteesHelper.deleteMenteeExtension(req.decodedToken.id)
	// 	} catch (error) {
	// 		return error
	// 	}
	// }
}
