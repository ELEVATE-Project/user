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

const failureResponse = ({ message = 'Oops! Something Went Wrong.', statusCode = 500, responseCode, result }) => {
	const error = new Error(message)
	error.statusCode = statusCode
	error.responseCode = responseCode
	error.data = result || []

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
		'/user/v1/organization/update',
	],
	internalAccessUrls: [
		'/user/v1/profile/details',
		'/user/v1/account/list',
		'/profile/share',
		'/user/v1/user/read',
		'/user/v1/admin/create',
		'/user/v1/organization/read',
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
		'/user/v1/org-admin/bulkUserCreate',
		'/user/v1/org-admin/getBulkInvitesFilesList',
		'/user/v1/org-admin/getRequestDetails',
		'/user/v1/org-admin/getRequests',
		'/user/v1/organization/requestOrgRole',
	],
	responseType: 'stream',
	roleAssociationModel: 'UserRole',
	roleAssociationName: 'user_roles',
	activeStatus: 'ACTIVE',
	inActiveStatus: 'INACTIVE',
	roleMentor: 'mentor',
	roleMentee: 'mentee',
	redisUserPrefix: 'user_',
	redisOrgPrefix: 'org_',
	location: 'location',
	languages: 'languages',
	typeSystem: 'system',
	roleOrgAdmin: 'org_admin',
	statusUploaded: 'UPLOADED',
	statusFailed: 'FAILED',
	statusProcessed: 'PROCESSED',
	statusRequested: 'REQUESTED',
	statusAccepted: 'APPROVED',
	statusRejected: 'REJECTED',
	statusUnderReview: 'UNDER_REVIEW',
	fileTypeCSV: 'text/csv',
	tempFolderForBulkUpload: '/public/invites',
	azureBlobType: 'BlockBlob',
	roleTypeSystem: 1,
	inviteeOutputFile: 'output-user-invite',
	csvExtension: '.csv',
}
