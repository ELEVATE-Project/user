/**
 * name : feedback.js
 * author : Rakesh Kumar
 * created-date : 02-Dec-2021
 * Description : Users Controller.
 */

// Dependencies
const { isAMentor } = require('@generics/utils')
const feedbackService = require('@services/feedback')
const userService = require('@services/users')

module.exports = class Users {
	/**
	 * Pending feedback.
	 * @method
	 * @name pendingFeedbacks
	 * @param {Object} req -request data.
	 * @param {String} req.decodedToken.id - User Id.
	 * @param {String} req.decodedToken.isAMentor - User Mentor key true/false.
	 * @returns {JSON} - Pending feedback information.
	 */

	async pendingFeedbacks(req) {
		try {
			const pendingFeedBacks = await feedbackService.pending(
				req.decodedToken.id,
				isAMentor(req.decodedToken.roles)
			)
			return pendingFeedBacks
		} catch (error) {
			return error
		}
	}

	/**
	 * list user based on type
	 * @method
	 * @name list
	 * @param {Object} req 						- request data.
	 * @param {Boolean} req.query.type 			- User Type mentor/mentee
	 * @param {Number} req.pageNo 				- page no.
	 * @param {Number} req.pageSize 			- page size limit.
	 * @param {String} req.searchText 			- search text.
	 * @param {Number}  req.decodedToken.id		- userId.
	 * @param {Boolean} isAMentor 				- user mentor or not.
	 * @returns {JSON} 							- List of user.
	 */

	async list(req) {
		try {
			const listUser = await userService.list(
				req.query.type,
				req.pageNo,
				req.pageSize,
				req.searchText,
				req.decodedToken.id,
				isAMentor(req.decodedToken.roles)
			)
			return listUser
		} catch (error) {
			return error
		}
	}
}
