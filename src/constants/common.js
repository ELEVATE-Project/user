/**
 * name : constants/common.js
 * author : Aman Kumar Gupta
 * Date : 04-Nov-2021
 * Description : All commonly used constants through out the service
 */

const FormsData = require('@db/forms/queries')
const utils = require('@generics/utils')
const successResponse = async ({ statusCode = 500, responseCode = 'OK', message, result = [], meta = {} }) => {
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
		meta: { ...meta, formsVersion: versions },
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
	guestUrls: ['/sessions/completed', '/sessions/updateRecordingUrl', '/sessions/details'],
	DELETE_METHOD: 'DELETE',
	dateFormat: 'dddd, Do MMMM YYYY',
	timeFormat: 'hh:mm A',
	MENTEE_SESSION_REMAINDER_EMAIL_CODE: 'mentee_session_reminder',
	MENTOR_SESSION_REMAINDER_EMAIL_CODE: 'mentor_session_reminder',
	MENTOR_SESSION_ONE_HOUR_REMAINDER_EMAIL_CODE: 'mentor_one_hour_before_session_reminder',
	UTC_DATE_TIME_FORMAT: 'YYYY-MM-DDTHH:mm:ss',
	internalAccessUrs: ['/notifications/emailCronJob'],
	COMPLETED_STATUS: 'completed',
	PUBLISHED_STATUS: 'published',
	LIVE_STATUS: 'live',
	MENTOR_EVALUATING: 'mentor',
	internalCacheExpirationTime: process.env.INTERNAL_CACHE_EXP_TIME, // In Seconds
	RedisCacheExpiryTime: process.env.REDIS_CACHE_EXP_TIME,
}
