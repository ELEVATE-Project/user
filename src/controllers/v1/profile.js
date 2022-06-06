/**
 * name : profile.js
 * author : Aman
 * created-date : 02-Nov-2021
 * Description : User Profile.
 */

// Dependencies
const profileHelper = require('@services/helper/profile')

module.exports = class Profile {
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
	 * User profile details
	 * @method
	 * @name details
	 * @param {Object} req -request data.
	 * @param {string} req.params._id - user id.
	 * @returns {JSON} - returns profile details.
	 */
	async details(req) {
		try {
			const profileDetails = await profileHelper.details(req.params.id ? req.params.id : req.decodedToken._id)
			return profileDetails
		} catch (error) {
			return error
		}
	}
}
