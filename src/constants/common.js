/**
 * name : constants/common.js
 * author : Aman Kumar Gupta
 * Date : 29-Sep-2021
 * Description : All commonly used constants through out the service
 */

const successResponse = ({ statusCode = 500, responseCode = 'OK', message, result = [] }) => {
	return {
		statusCode,
		responseCode,
		message,
		result,
	}
}

const failureResponse = ({ message = 'Oops! Something Went Wrong.', statusCode = 500, responseCode }) => {
	const error = new Error(message)
	error.statusCode = statusCode
	error.responseCode = responseCode
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
		'/user/v1/account/login',
		'/user/v1/account/create',
		'/user/v1/account/generateToken',
		'/user/v1/account/generateOtp',
		'/user/v1/account/registrationOtp',
		'/user/v1/account/resetPassword',
		'/user/v1/systemUsers/create',
		'/user/v1/systemUsers/login',
	],
	internalAccessUrls: [
		'bulkCreateMentors',
		'/user/v1/account/verifyMentor',
		'profile/details',
		'/user/v1/account/list',
		'/profile/share',
	],
	notificationEmailType: 'email',
	accessTokenExpiry: `${process.env.ACCESS_TOKEN_EXPIRY}d`,
	refreshTokenExpiry: `${process.env.REFRESH_TOKEN_EXPIRY}d`,
	refreshTokenExpiryInMs: Number(process.env.REFRESH_TOKEN_EXPIRY) * 24 * 60 * 60 * 1000,
	otpExpirationTime: process.env.OTP_EXP_TIME, // In Seconds
}
