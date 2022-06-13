const userBaseUrl = process.env.USER_SERIVCE_HOST + process.env.USER_SERIVCE_BASE_URL
const request = require('@generics/requests')
const endpoints = require('@constants/endpoints')
const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')

module.exports = class UserHelper {
	/**
	 * User list.
	 * @method
	 * @name list
	 * @param {Boolean} userType - mentor/mentee.
	 * @param {Number} page - page No.
	 * @param {Number} limit - page limit.
	 * @param {String} search - search field.
	 * @returns {JSON} - List of users
	 */

	static async list(userType, pageNo, pageSize, searchText) {
		try {
			const apiUrl =
				userBaseUrl +
				endpoints.USERS_LIST +
				'?type=' +
				userType +
				'&page=' +
				pageNo +
				'&limit=' +
				pageSize +
				'&search=' +
				searchText
			const userDetails = await request.get(apiUrl, false, true)
			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: userDetails.data.message,
				result: userDetails.data.result,
			})
		} catch (error) {
			return error
		}
	}
}
