// Dependencies
const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const userRequests = require('@requests/user')
const menteeQueries = require('@database/queries/userExtension')
const mentorQueries = require('@database/queries/mentorExtension')
module.exports = class UserHelper {
	/**
	 * Get user list.
	 * @method
	 * @name create
	 * @param {String} userType 				- mentee/mentor.
	 * @param {Number} pageSize 				- Page size.
	 * @param {Number} pageNo 					- Page number.
	 * @param {String} searchText 				- Search text.
	 * @param {Number} searchText 				- userId.
	 * @param {Boolean} isAMentor 				- user mentor or not.
	 * @returns {JSON} 							- User list.
	 */

	static async list(userType, pageNo, pageSize, searchText, userId, isAMentor) {
		try {
			const userDetails = await userRequests.list(userType, pageNo, pageSize, searchText)
			const ids = userDetails.data.result.data.map((item) => item.values[0].id)

			let extensionDetails
			if (userType == common.MENTEE_ROLE) {
				extensionDetails = await menteeQueries.getUsersByUserIds(ids, {
					attributes: ['user_id', 'rating'],
				})
			} else if (userType == common.MENTOR_ROLE) {
				extensionDetails = await mentorQueries.getMentorsByUserIds(ids, {
					attributes: ['user_id', 'rating', 'visibility', 'org_id'],
				})
				// Inside your function
				extensionDetails = extensionDetails.filter((item) => item.visibility && item.org_id)

				// Filter user data based on SAAS policy
				extensionDetails = await this.filterMentorListBasedOnSaasPolicy(extensionDetails, userId, isAMentor)
			}
			const extensionDataMap = new Map(extensionDetails.map((newItem) => [newItem.user_id, newItem]))

			userDetails.data.result.data = userDetails.data.result.data.filter((existingItem) => {
				const user_id = existingItem.values[0].id
				if (extensionDataMap.has(user_id)) {
					const newItem = extensionDataMap.get(user_id)
					existingItem.values[0] = { ...existingItem.values[0], ...newItem }
					delete existingItem.values[0].user_id
					delete existingItem.values[0].visibility
					delete existingItem.values[0].org_id
					return true // Keep this item
				}

				return false // Remove this item
			})

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: userDetails.data.message,
				result: userDetails.data.result,
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * @description 							- Filter mentor list based on user's saas policy.
	 * @method
	 * @name filterMentorListBasedOnSaasPolicy
	 * @param {Array} userData 					- User data.
	 * @param {Number} userId 					- User id.
	 * @param {Boolean} isAMentor 				- user mentor or not.
	 * @returns {JSON} 							- List of filtered sessions
	 */
	static async filterMentorListBasedOnSaasPolicy(userData, userId, isAMentor) {
		try {
			if (userData.length === 0) {
				return userData
			}

			let userPolicyDetails
			// If user is mentor - fetch policy details from mentor extensions else fetch from userExtension
			if (isAMentor) {
				userPolicyDetails = await mentorQueries.getMentorExtension(userId, [
					'external_mentor_visibility',
					'org_id',
				])

				// Throw error if mentor extension not found
				if (Object.keys(userPolicyDetails).length === 0) {
					return common.failureResponse({
						statusCode: httpStatusCode.bad_request,
						message: 'MENTORS_NOT_FOUND',
						responseCode: 'CLIENT_ERROR',
					})
				}
			} else {
				userPolicyDetails = await menteeQueries.getMenteeExtension(userId, [
					'external_mentor_visibility',
					'org_id',
				])
				// If no mentee present return error
				if (Object.keys(userPolicyDetails).length === 0) {
					return common.failureResponse({
						statusCode: httpStatusCode.not_found,
						message: 'MENTEE_EXTENSION_NOT_FOUND',
						responseCode: 'CLIENT_ERROR',
					})
				}
			}

			if (userPolicyDetails.external_mentor_visibility && userPolicyDetails.org_id) {
				// Filter user data based on policy
				const filteredUserData = await Promise.all(
					userData.map(async (user) => {
						if (
							user.visibility === common.CURRENT ||
							(user.visibility === common.ALL &&
								userPolicyDetails.external_mentor_visibility === common.CURRENT)
						) {
							// Check if the mentor's organization matches the user's organization(who is calling the api).
							if (user.org_id === userPolicyDetails.org_id) {
								return user
							}
						} else {
							return user
						}
					})
				)
				// Remove any undefined elements (user that didn't meet the conditions)
				userData = filteredUserData.filter((user) => user !== undefined)
			}
			return userData
		} catch (err) {
			return err
		}
	}
}
