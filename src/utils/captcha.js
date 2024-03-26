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
	if (process.env.CAPTCHA_SERVICE == 'googleRecaptcha') {
		if (process.env.GOOGLE_RECAPTCHA_METHOD === 'POST')
			response = await requester.post(
				process.env.GOOGLE_RECAPTCHA_HOST,
				process.env.GOOGLE_RECAPTCHA_URL,
				headers,
				requestBody,
				queryParams
			)
	}
	if (response.success) return true
	else if (!response.success) return false
}
