const request = require('request')

const apiEndpoints = require('@constants/endpoints')
const apiResponses = require('@constants/api-responses')
const apiBaseUrl = process.env.USER_SERIVCE_HOST + process.env.USER_SERIVCE_BASE_URL

module.exports = class SessionAttendeesHelper {
	/**
	 * Get Accounts details.
	 * @method
	 * @name getAllAccountsDetail
	 * @param {Array} userIds
	 * @returns
	 */
	static getAllAccountsDetail(userIds) {
		const options = {
			headers: {
				'Content-Type': 'application/json',
				internal_access_token: process.env.INTERNAL_ACCESS_TOKEN,
			},
			form: {
				userIds,
			},
		}
		const apiUrl = apiBaseUrl + apiEndpoints.LIST_ACCOUNTS
		try {
			request.post(apiUrl, options, (err, data) => {
				if (err) {
					return {
						message: apiResponses.USER_SERVICE_DOWN,
					}
				} else {
					data.body = JSON.parse(data.body)
					return data.body
				}
			})
		} catch (error) {
			return error
		}
	}
}
