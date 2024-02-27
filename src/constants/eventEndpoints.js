module.exports = {
	eventEndpoints: {
		roleChange: [
			{
				method: 'POST',
				baseUrl: `${process.env.MENTORING_SERVICE_URL}`,
				route: '/mentoring/v1/org-admin/roleChange',
			},
		],
		deactivateUpcomingSession: [
			{
				method: 'POST',
				baseUrl: `${process.env.MENTORING_SERVICE_URL}`,
				route: '/mentoring/v1/org-admin/deactivateUpcomingSession',
			},
		],
		updateOrganization: [
			{
				method: 'POST',
				baseUrl: `${process.env.MENTORING_SERVICE_URL}`,
				route: '/mentoring/v1/org-admin/updateOrganization',
			},
		],
		updateRelatedOrgs: [
			{
				method: 'POST',
				baseUrl: `${process.env.MENTORING_SERVICE_URL}`,
				route: '/mentoring/v1/org-admin/updateRelatedOrgs',
			},
		],
		updateName: [
			{
				method: 'POST',
				baseUrl: `${process.env.MENTORING_SERVICE_URL}`,
				route: '/mentoring/v1/sessions/bulkUpdateMentorNames',
			},
		],
	},
}
