/**
 * name : constants/common.js
 * author : Aman Kumar Gupta
 * Date : 29-Sep-2021
 * Description : All commonly used constants through out the service
 */

const utils = require('@generics/utils')
const FormsData = require('@db/forms/queries')
const correlationId = require('@log/correlation-id')
const { logger } = require('@log/logger')

const successResponse = async ({ statusCode = 500, responseCode = 'OK', message, result = [], meta = {} }) => {
	// await new Promise((r) => setTimeout(r, 5000))
	const formVersionData = (await utils.internalGet('formVersion')) || false
	let versions = {}
	if (formVersionData) {
		versions = formVersionData
	} else {
		versions = await FormsData.findAllTypeFormVersion()
		await utils.internalSet('formVersion', versions)
	}
	return {
		statusCode,
		responseCode,
		message,
		result,
		meta: { ...meta, formsVersion: versions, correlation: correlationId.getId() },
	}
}

const failureResponse = ({ message = 'Oops! Something Went Wrong.', statusCode = 500, responseCode }) => {
	const error = new Error(message)
	error.statusCode = statusCode
	error.responseCode = responseCode
	logger.warn(error)
	return error
}

module.exports = {
	pagination: {
		DEFAULT_PAGE_NO: 1,
		DEFAULT_PAGE_SIZE: 100,
	},
	successResponse,
	failureResponse,
	guestUrls: [
		'/userlog/v1/account/login',
		'/userlog/v1/account/create',
		'/userlog/v1/account/generateToken',
		'/userlog/v1/account/generateOtp',
		'/userlog/v1/account/registrationOtp',
		'/userlog/v1/account/resetPassword',
		'/userlog/v1/systemUsers/create',
		'/userlog/v1/systemUsers/login',
	],
	internalAccessUrls: [
		'bulkCreateMentors',
		'/userlog/v1/account/verifyMentor',
		'profile/details',
		'/userlog/v1/account/list',
		'/profile/share',
	],
	notificationEmailType: 'email',
	accessTokenExpiry: `${process.env.ACCESS_TOKEN_EXPIRY}d`,
	refreshTokenExpiry: `${process.env.REFRESH_TOKEN_EXPIRY}d`,
	refreshTokenExpiryInMs: Number(process.env.REFRESH_TOKEN_EXPIRY) * 24 * 60 * 60 * 1000,
	otpExpirationTime: process.env.OTP_EXP_TIME, // In Seconds
}
