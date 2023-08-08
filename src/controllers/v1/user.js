/**
 * name : users.js
 * author : Priyanka Pradeep
 * created-date : 17-July-2023
 * Description : User.
 */

// Dependencies
const userHelper = require('@services/helper/user')

module.exports = class User {
	/**
	 * Updates user data
	 * @method
	 * @name update
	 * @param {Object} req -request data.
	 * @param {Object} req.body - contains user data.
	 * @returns {JSON} - user updated data.
	 */

	async update(req) {
		const params = req.body
		try {
			const updatedUser = await userHelper.update(params, req.decodedToken.id)
			return updatedUser
		} catch (error) {
			return error
		}
	}

	/**
	 * User details
	 * @method
	 * @name read
	 * @param {Object} req -request data.
	 * @param {string} req.params.id - user id.
	 * @param {string} req.headers.internal_access_token - to get deleted user details
	 * @returns {JSON} - returns user details.
	 */
	async read(req) {
		try {
			const userDetails = await userHelper.read(req.params.id ? req.params.id : req.decodedToken.id, req.headers)
			return userDetails
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
			const shareLink = await userHelper.share(req.params.id)
			return shareLink
		} catch (error) {
			return error
		}
	}
}
