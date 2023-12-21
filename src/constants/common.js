/**
 * name : constants/common.js
 * author : Aman Kumar Gupta
 * Date : 04-Nov-2021
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
		meta: {
			...meta,
			formsVersion: versions,
			correlation: correlationId.getId(),
			meetingPlatform: process.env.DEFAULT_MEETING_SERVICE,
		},
	}
	logger.info('Request Response', { response: response })

	return response
}

const failureResponse = ({ message = 'Oops! Something Went Wrong.', statusCode = 500, responseCode, result }) => {
	const errorMessage = message.key || message

	const error = new Error(errorMessage)
	error.statusCode = statusCode
	error.responseCode = responseCode
	error.interpolation = message?.interpolation || false
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
		'/sessions/completed',
		'/sessions/updateRecordingUrl',
		'/sessions/details',
		'/mentors/profile/',
		'/mentors/upcomingSessions/',
		'/platform/config',
	],
	DELETE_METHOD: 'DELETE',
	dateFormat: 'dddd, Do MMMM YYYY',
	timeFormat: 'hh:mm A',
	MENTEE_SESSION_REMAINDER_EMAIL_CODE: 'mentee_session_reminder',
	MENTOR_SESSION_REMAINDER_EMAIL_CODE: 'mentor_session_reminder',
	MENTOR_SESSION_ONE_HOUR_REMAINDER_EMAIL_CODE: 'mentor_one_hour_before_session_reminder',
	UTC_DATE_TIME_FORMAT: 'YYYY-MM-DDTHH:mm:ss',
	internalAccessUrs: [
		'/notifications/emailCronJob',
		'/org-admin/roleChange',
		'/org-admin/updateOrganization',
		'/org-admin/deactivateUpcomingSession',
		'/admin/triggerPeriodicViewRefreshInternal',
		'/admin/triggerViewRebuildInternal',
		'/org-admin/updateRelatedOrgs',
		'/sessions/completed',
	],
	COMPLETED_STATUS: 'COMPLETED',
	UNFULFILLED_STATUS: 'UNFULFILLED',
	PUBLISHED_STATUS: 'PUBLISHED',
	LIVE_STATUS: 'LIVE',
	MENTOR_EVALUATING: 'mentor',
	internalCacheExpirationTime: process.env.INTERNAL_CACHE_EXP_TIME, // In Seconds
	RedisCacheExpiryTime: process.env.REDIS_CACHE_EXP_TIME,
	BBB_VALUE: 'BBB', // BigBlueButton code
	BBB_PLATFORM: 'BigBlueButton (Default)',
	REPORT_EMAIL_SUBJECT: 'Having issue in logging in/signing up',
	ADMIN_ROLE: 'admin',
	roleValidationPaths: [
		'/sessions/enroll/',
		'/sessions/unEnroll/',
		'/sessions/update',
		'/feedback/submit/',
		'/sessions/start/',
		'/mentors/share/',
		'/mentees/joinSession/',
		'/mentors/upcomingSessions/',
		'/issues/create',
	],
	MENTOR_ROLE: 'mentor',
	MENTEE_ROLE: 'mentee',
	MEDIUM: 'medium',
	RECOMMENDED_FOR: 'recommended_for',
	CATEGORIES: 'categories',
	jobsToCreate: [
		{
			jobId: 'mentoring_session_one_hour_',
			jobName: 'notificationBeforeAnHour',
			emailTemplate: 'mentor_one_hour_before_session_reminder',
		},
		{
			jobId: 'mentoring_session_one_day_',
			jobName: 'notificationBeforeOneDay',
			emailTemplate: 'mentor_session_reminder',
		},
		{
			jobId: 'mentoring_session_fifteen_min_',
			jobName: 'notificationBeforeFifteenMin',
			emailTemplate: 'mentee_session_reminder',
		},
		{
			jobId: 'job_to_mark_session_as_completed_',
			jobName: 'job_to_mark_session_as_completed_',
		},
	],
	notificationJobIdPrefixes: [
		'mentoring_session_one_hour_',
		'mentoring_session_one_day_',
		'mentoring_session_fifteen_min_',
	],
	jobPrefixToMarkSessionAsCompleted: 'job_to_mark_session_as_completed_',
	ORG_ADMIN_ROLE: 'org_admin',

	// Default organization policies
	DEFAULT_ORGANISATION_POLICY: {
		session_visibility_policy: 'CURRENT',
		mentor_visibility_policy: 'CURRENT',
		external_session_visibility_policy: 'CURRENT',
		external_mentor_visibility_policy: 'CURRENT',
		allow_mentor_override: false,
		approval_required_for: [],
	},
	CURRENT: 'CURRENT',
	ALL: 'ALL',
	ASSOCIATED: 'ASSOCIATED',
	PATCH_METHOD: 'PATCH',
	GET_METHOD: 'GET',
	POST_METHOD: 'POST',
	excludedQueryParams: ['enrolled'],
	materializedViewsPrefix: 'm_',
	mentorExtensionModelName: 'MentorExtension',
	sessionModelName: 'Session',
	notificationEndPoint: '/mentoring/v1/notifications/emailCronJob',
	sessionCompleteEndpoint: '/mentoring/v1/sessions/completed/',
	INACTIVE_STATUS: 'INACTIVE',
}
