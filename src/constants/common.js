/**
 * name : constants/common.js
 * author : Aman Kumar Gupta
 * Date : 29-Sep-2021
 * Description : All commonly used constants through out the service
 */

const form = require('@generics/form')
const { elevateLog, correlationId } = require('elevate-logger')
const logger = elevateLog.init()
const successResponse = async ({ statusCode = 500, responseCode = 'OK', message, result = [], meta = {} }) => {
	const versions = await form.getAllFormsVersion()
	let response = {
		statusCode,
		responseCode,
		message,
		result,
		meta: { ...meta, formsVersion: versions, correlation: correlationId.getId() },
	}
	logger.info('Request Response', { response: response })

	return response
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
		'/user/v1/admin/login',
		'/user/v1/userRole/list',
		'/user/v1/organization/create',
	],
	internalAccessUrls: [
		'bulkCreateMentors',
		'/user/v1/account/verifyMentor',
		'/user/v1/profile/details',
		'/user/v1/account/list',
		'/profile/share',
		'/user/v1/admin/create',
		'/user/v1/organization/update',
		'/user/v1/user/read',
	],
	notificationEmailType: 'email',
	accessTokenExpiry: `${process.env.ACCESS_TOKEN_EXPIRY}d`,
	refreshTokenExpiry: `${process.env.REFRESH_TOKEN_EXPIRY}d`,
	refreshTokenExpiryInMs: Number(process.env.REFRESH_TOKEN_EXPIRY) * 24 * 60 * 60 * 1000,
	refreshTokenLimit: 3,
	otpExpirationTime: process.env.OTP_EXP_TIME, // In Seconds,
	roleAdmin: 'admin',
	roleUser: 'user',
	roleValidationPaths: [
		'/user/v1/account/verifyMentor',
		'/user/v1/accounts/verifyUser',
		'/user/v1/accounts/changeRole',
		'/user/v1/user/update',
		'/user/v1/user/share',
		'/user/v1/user/read',
	],
	roleAssociationModel: 'UserRole',
	roleAssociationName: 'user_roles',
	activeStatus: 'active',
	roleMentor: 'mentor',
	redisUserPrefix: 'user_',
	redisOrgPrefix: 'org_',
	location: 'location',
	languages: 'languages',
}
