'use strict'
const common = require('@constants/common')
const requester = require('@utils/requester')

exports.verifyCaptchaToken = async (token, options = {}) => {
	const headers = {
		'Content-Type': 'application/x-www-form-urlencoded',
	}
	const requestBody = `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`
	const queryParams = {}
	let response
	if (process.env.CAPTCHA_SERVICE == 'googleRecaptcha') {
		response = await requester.post(
			process.env.GOOGLE_RECAPTCHA_HOST,
			process.env.GOOGLE_RECAPTCHA_URL,
			headers,
			requestBody,
			queryParams
		)
	}
	if (response.success) return true

	return false
}
