const userBaseUrl = process.env.USER_SERIVCE_HOST + process.env.USER_SERIVCE_BASE_URL
const request = require('@generics/requests')
const endpoints = require('@constants/endpoints')
const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')

module.exports = class UserProfileHelper {
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

	static list(userType, pageNo, pageSize, searchText) {
		return new Promise(async (resolve, reject) => {
			try {
				const apiUrl =
					userBaseUrl +
					endpoints.LIST_USERS +
					'?type=' +
					userType +
					'&page=' +
					pageNo +
					'&limit=' +
					pageSize +
					'&search=' +
					searchText
				const userDetails = await request.get(apiUrl, false, true)
				return resolve(
					common.successResponse({
						statusCode: httpStatusCode.ok,
						message: userDetails.data.message,
						result: userDetails.data.result,
					})
				)
			} catch (error) {
				return reject(error)
			}
		})
	}
}
