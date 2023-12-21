/**
 * name : mentors.js
 * author : Aman
 * created-date : 12-Oct-2021
 * Description : Mentors.
 */

// Dependencies
const mentorsService = require('@services/mentors')
const { isAMentor } = require('@generics/utils')

module.exports = class Mentors {
	/**
	 * mentors profile
	 * @method
	 * @name profile
	 * @param {Object} req - request data.
	 * @param {String} req.params.id - mentor Id.
	 * @param {String} req.pageNo - Page No.
	 * @param {String} req.pageSize - Page size limit.
	 * @param {String} req.searchText - Search text.
	 * @returns {JSON} - mentors upcoming session details
	 */
	async upcomingSessions(req) {
		try {
			return await mentorsService.upcomingSessions(
				req.params.id,
				req.pageNo,
				req.pageSize,
				req.searchText,
				req.params.menteeId ? req.params.menteeId : req?.decodedToken?.id,
				req.query,
				isAMentor(req.decodedToken.roles)
			)
		} catch (error) {
			return error
		}
	}

	/**
	 * mentors profile
	 * @method
	 * @name profile
	 * @param {Object} req 							- request data.
	 * @param {String} req.params.id 				- mentor Id.
	 * @param {Number}  req.decodedToken.id			- userId.
	 * @param {Boolean} isAMentor 					- user mentor or not.
	 * @returns {JSON} 								- mentors profile details
	 */
	async details(req) {
		try {
			return await mentorsService.read(req.params.id, '', req.decodedToken.id, isAMentor(req.decodedToken.roles))
		} catch (error) {
			return error
		}
	}
	/**
	 * Mentors reports
	 * @method
	 * @name reports
	 * @param {Object} req - request data.
	 * @param {String} req.decodedToken.id - User Id.
	 * @param {String} req.query.filterType - filterType.
	 * @param {String} [req.query.filterType = "MONTHLY"] - Monthly reports.
	 * @param {String} [req.query.filterType = "WEEKLY"] - Weekly report.
	 * @param {String} [req.query.filterType = "QUARTERLY"] - Quarterly report.
	 * @returns {JSON} - Mentors reports.
	 */

	async reports(req) {
		try {
			const reports = await mentorsService.reports(
				req.decodedToken.id,
				req.query.filterType,
				req.decodedToken.roles
			)
			return reports
		} catch (error) {
			return error
		}
	}

	/**
	 * Shareable mentor profile link.
	 * @method
	 * @name share
	 * @param {Object} req - Request data.
	 * @param {String} req.params.id - Mentors user id.
	 * @returns {JSON} - Returns sharable link of the mentor.
	 */

	async share(req) {
		try {
			const shareLink = await mentorsService.share(req.params.id)
			return shareLink
		} catch (error) {
			return error
		}
	}

	/**
	 * List of available mentors.
	 * @method
	 * @name list
	 * @param {Number} req.pageNo 				- page no.
	 * @param {Number} req.pageSize 			- page size limit.
	 * @param {String} req.searchText 			- search text.
	 * @param {Number}  req.decodedToken.id		- userId.
	 * @param {Boolean} isAMentor 				- user mentor or not.
	 * @returns {JSON} 							- List of mentors.
	 */

	async list(req) {
		try {
			return await mentorsService.list(
				req.pageNo,
				req.pageSize,
				req.searchText,
				req.query,
				req.decodedToken.id,
				isAMentor(req.decodedToken.roles)
			)
		} catch (error) {
			return error
		}
	}

	/**
	 * List of sessions created by mentor.
	 * @method
	 * @name list
	 * @param {Object} req - Request data.
	 * @param {String} req.decodedToken.id - Mentors user id.
	 * @returns {JSON} - Returns sharable link of the mentor.
	 */

	async createdSessions(req) {
		try {
			const sessionDetails = await mentorsService.createdSessions(
				req.decodedToken.id,
				req.pageNo,
				req.pageSize,
				req.searchText,
				req.query.status,
				req.decodedToken.roles
			)
			return sessionDetails
		} catch (error) {
			return error
		}
	}

	//To be removed later
	// /**
	//  * Create a new mentor extension.
	//  * @method
	//  * @name createMentorExtension
	//  * @param {Object} req - Request data.
	//  * @param {Object} req.body - Mentor extension data excluding userid.
	//  * @returns {Promise<Object>} - Created mentor extension details.
	//  */
	// async create(req) {
	// 	try {
	// 		return await mentorsHelper.createMentorExtension(req.body, req.decodedToken.id)
	// 	} catch (error) {
	// 		console.error(error)
	// 		return error
	// 	}
	// }
	// /**
	//  * Update a mentor extension.
	//  * @method
	//  * @name updateMentorExtension
	//  * @param {Object} req - Request data.
	//  * @param {String} req.decodedToken.id - User ID of the mentor.
	//  * @param {Object} req.body - Updated mentor extension data excluding userid.
	//  * @returns {Promise<Object>} - Updated mentor extension details.
	//  */

	// async update(req) {
	// 	try {
	// 		return await mentorsHelper.updateMentorExtension(req.body, req.decodedToken.id)
	// 	} catch (error) {
	// 		return error
	// 	}
	// }
	// /**
	//  * Get mentor extension by user ID.
	//  * @method
	//  * @name getMentorExtension
	//  * @param {Object} req - Request data.
	//  * @param {String} req.params.id - User ID of the mentor.
	//  * @returns {Promise<Object>} - Mentor extension details.
	//  */
	// async getMentorExtension(req) {
	// 	try {
	// 		return await mentorsHelper.getMentorExtension(req.query.id || req.decodedToken.id) //params since read will be public for mentors
	// 	} catch (error) {
	// 		return error
	// 	}
	// }
	// /**
	//  * Delete a mentor extension by user ID.
	//  * @method
	//  * @name deleteMentorExtension
	//  * @param {Object} req - Request data.
	//  * @param {String} req.decodedToken._id - User ID of the mentor.
	//  * @returns {Promise<Boolean>} - True if deleted successfully, otherwise false.
	//  */
	// async deleteMentorExtension(req) {
	// 	try {
	// 		return await mentorsHelper.deleteMentorExtension(req.decodedToken.id)
	// 	} catch (error) {
	// 		return error
	// 	}
	// }
}
