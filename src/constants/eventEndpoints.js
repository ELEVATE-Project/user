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
	},
}
