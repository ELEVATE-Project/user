module.exports = {
	eventEndpoints: {
		roleChange: [
			{
				method: 'POST',
				baseUrl: `${process.env.MENTORING_SERVICE_URL}`,
				route: '/v1/org-admin/roleChange',
			},
		],
	},
}
