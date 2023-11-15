/**
 * name : user.js
 * author : Vishnu
 * created-date : 27-Sept-2023
 * Description : Internal calls to elevate-user service.
 */

// Dependencies
const userBaseUrl = process.env.USER_SERVICE_HOST + process.env.USER_SERVICE_BASE_URL
const requests = require('@generics/requests')
const endpoints = require('@constants/endpoints')
const request = require('request')
const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')
const utilsHelper = require('@generics/utils')

/**
 * Fetches the default organization details for a given organization code/id.
 * @param {string} organisationIdentifier - The code/id of the organization.
 * @returns {Promise} A promise that resolves with the organization details or rejects with an error.
 */

const fetchDefaultOrgDetails = function (organisationIdentifier) {
	return new Promise(async (resolve, reject) => {
		try {
			let orgReadUrl
			if (!isNaN(organisationIdentifier)) {
				orgReadUrl = userBaseUrl + endpoints.ORGANIZATION_READ + '?organisation_id=' + organisationIdentifier
			} else {
				orgReadUrl = userBaseUrl + endpoints.ORGANIZATION_READ + '?organisation_code=' + organisationIdentifier
			}

			let internalToken = true

			const orgDetails = await requests.get(
				orgReadUrl,
				'', // X-auth-token not required for internal call
				internalToken
			)

			return resolve(orgDetails)
		} catch (error) {
			return reject(error)
		}
	})
}

/**
 * User profile details.
 * @method
 * @name details
 * @param {String} [token =  ""] - token information.
 * @param {String} [userId =  ""] - user id.
 * @returns {JSON} - User profile details.
 */

const details = function (token = '', userId = '') {
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
 * Get Accounts details.
 * @method
 * @name getAllAccountsDetail
 * @param {Array} userIds
 * @returns
 */

const getListOfUserDetails = function (userIds) {
	return new Promise(async (resolve, reject) => {
		const options = {
			headers: {
				'Content-Type': 'application/json',
				internal_access_token: process.env.INTERNAL_ACCESS_TOKEN,
			},
			form: {
				userIds,
			},
		}

		const apiUrl = userBaseUrl + endpoints.LIST_ACCOUNTS
		try {
			request.get(apiUrl, options, callback)
			function callback(err, data) {
				if (err) {
					reject({
						message: 'USER_SERVICE_DOWN',
					})
				} else {
					data.body = JSON.parse(data.body)
					return resolve(data.body)
				}
			}
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

const share = function (profileId) {
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

const list = function (userType, pageNo, pageSize, searchText) {
	return new Promise(async (resolve, reject) => {
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
			const userDetails = await requests.get(apiUrl, false, true)

			return resolve(userDetails)
		} catch (error) {
			return reject(error)
		}
	})
}

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

const listWithoutLimit = function (userType, searchText) {
	return new Promise(async (resolve, reject) => {
		try {
			const apiUrl = userBaseUrl + endpoints.USERS_LIST + '?type=' + userType + '&search=' + searchText
			const userDetails = await requests.get(apiUrl, false, true)

			return resolve(userDetails)
		} catch (error) {
			return reject(error)
		}
	})
}

module.exports = {
	fetchDefaultOrgDetails,
	details,
	getListOfUserDetails,
	list,
	share,
	listWithoutLimit,
}
