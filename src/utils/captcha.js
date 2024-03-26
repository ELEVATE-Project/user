'use strict'
const common = require('@constants/common')
const requester = require('@utils/requester')

exports.verifyCaptchaToken = async (token, options = {}) => {
	const headers = {
		secret: process.env.RECAPTCHA_SECRET_KEY,
		response: token,
	}
	const requestBody = {}
	const queryParams = {}
	let response
	if (common.google_recaptcha_API.METHOD === 'POST')
		response = await requester.post(
			common.google_recaptcha_API.HOST,
			common.google_recaptcha_API.URL,
			headers,
			requestBody,
			queryParams
		)
	else if (common.google_recaptcha_API.METHOD === 'GET')
		response = await requester.get(
			ecommon.google_recaptcha_API.HOST,
			common.google_recaptcha_API.URL,
			headers,
			pathParams,
			queryParams
		)
	if (response.success) return true

	return false
}
