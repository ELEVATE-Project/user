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
	 * Updates user profile
	 * @method
	 * @name update
	 * @param {Object} req -request data.
	 * @param {Object} req.body - contains user data.
	 * @returns {JSON} - profile updated data.
	 */

	async update(req) {
		const params = req.body
		try {
			const updatedProfile = await profileHelper.update(params, req.decodedToken._id)
			return updatedProfile
		} catch (error) {
			return error
		}
	}

	/**
	 * User details
	 * @method
	 * @name read
	 * @param {Object} req -request data.
	 * @param {string} req.params._id - user id.
	 * @returns {JSON} - returns user details.
	 */
	async read(req) {
		try {
			const userDetails = await userHelper.read(req.params.id ? req.params.id : req.decodedToken.id)
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
