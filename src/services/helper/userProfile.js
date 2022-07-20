// Dependencies
const userBaseUrl = process.env.USER_SERIVCE_HOST + process.env.USER_SERIVCE_BASE_URL
const requests = require('@generics/requests')
const endpoints = require('@constants/endpoints')
const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')

module.exports = class UserProfileHelper {
	/**
	 * User profile details.
	 * @method
	 * @name details
	 * @param {String} [token =  ""] - token information.
	 * @param {String} [userId =  ""] - user id.
	 * @returns {JSON} - User profile details.
	 */

	static details(token = '', userId = '') {
		return new Promise(async (resolve, reject) => {
			try {
				let profileUrl = userBaseUrl + endpoints.USER_PROFILE_DETAILS

				let internalToken = false
				if (userId != '') {
					profileUrl = profileUrl + '/' + userId
					internalToken = true
				}
				const profileDetails = await requests.get(profileUrl, token, internalToken)
				return resolve(profileDetails)
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * Share a mentor Profile.
	 * @method
	 * @name share
	 * @param {String} profileId - Profile id.
	 * @returns {JSON} - Shareable profile link.
	 */

	static share(profileId) {
		return new Promise(async (resolve, reject) => {
			const apiUrl = userBaseUrl + endpoints.SHARE_MENTOR_PROFILE + '/' + profileId
			try {
				let shareLink = await requests.get(apiUrl, false, true)
				if (shareLink.data.responseCode === 'CLIENT_ERROR') {
					return resolve(
						common.failureResponse({
							message: shareLink.data.message,
							statusCode: httpStatusCode.bad_request,
							responseCode: 'CLIENT_ERROR',
						})
					)
				}
				return resolve(
					common.successResponse({
						statusCode: httpStatusCode.ok,
						message: shareLink.data.message,
						result: shareLink.data.result,
					})
				)
			} catch (error) {
				reject(error)
			}
		})
	}
}
