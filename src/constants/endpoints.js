module.exports = {
	VERIFY_MENTOR: 'v1/account/verifyMentor',
	LIST_ACCOUNTS: 'v1/account/list',
	USER_PROFILE_DETAILS: 'v1/user/read',
	CREATE_MEETING: 'api/create',
	JOIN_MEETING: 'api/join',
	GET_RECORDINGS: 'api/getRecordings',
	USERS_LIST: 'v1/account/list',
	SHARE_MENTOR_PROFILE: 'v1/user/share',
	USERS_ENTITY_READ: 'v1/userentity/read',
	ORGANIZATION_READ: 'v1/organization/read',
	SEARCH_USERS: 'v1/account/search',
	// Endpoints of the scheduler service
	CREATE_SCHEDULER_JOB: 'jobs/create', // Create scheduler job endpoint
	UPDATE_DELAY: 'jobs/updateDelay', // Update delay of scheduled job endpoint
	REMOVE_SCHEDULED_JOB: 'jobs/remove', // Remove scheduled job endpoint
}
