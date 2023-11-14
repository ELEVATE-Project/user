'use strict'
const events = require('@constants/eventEndpoints')
const requester = require('@utils/requester')

exports.eventBroadcaster = async (
	action,
	{
		requestBody = {},
		headers = { internal_access_token: process.env.INTERNAL_ACCESS_TOKEN },
		pathParams = {},
		queryParams = {},
	}
) => {
	try {
		const endPoints = events.eventEndpoints[action]
		await Promise.all(
			endPoints.map((endPoint) => {
				if (endPoint.method === 'POST')
					requester.post(endPoint.baseUrl, endPoint.route, headers, requestBody, queryParams)
				else if (endPoints.method === 'GET')
					requester.get(endPoint.baseUrl, endPoint.route, headers, pathParams, queryParams)
			})
		)
	} catch (err) {
		console.log(err)
	}
}
