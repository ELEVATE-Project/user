'use strict'
const events = require('@constants/eventEndpoints')
const requester = require('@utils/requester')

exports.eventBroadcasterMain = async (eventGroup, { requestBody, headers = {}, isInternal = true }) => {
	try {
		if (isInternal) headers.internal_access_token = process.env.INTERNAL_ACCESS_TOKEN
		const endPoints = events.eventEndpoints[eventGroup]
		const requestPromises = endPoints.map((endPoint) => {
			return requester.post(endPoint.url, '', headers, requestBody)
		})
		const results = await Promise.allSettled(requestPromises)
		results.forEach((result, index) => {
			if (result.status === 'rejected')
				console.error(`Error for endpoint ${endPoints[index].url}:`, result.reason)
		})
	} catch (err) {
		console.log(err)
	}
}
