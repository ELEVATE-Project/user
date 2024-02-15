'use strict'
const requester = require('@utils/requester')

const getEndpoints = (eventGroup) => {
	switch (eventGroup) {
		case 'organizationEvents':
			if (process.env.EVENT_ORG_LISTENER_URLS)
				return process.env.EVENT_ORG_LISTENER_URLS.split(',').filter((url) => url.trim())
			return []
		default:
			return []
	}
}

const isEventEnabled = (eventGroup) => {
	switch (eventGroup) {
		case 'organizationEvents':
			return process.env.EVENT_ENABLE_ORG_EVENTS !== 'false'
		default:
			return true
	}
}

exports.eventBroadcasterMain = async (eventGroup, { requestBody, headers = {}, isInternal = true }) => {
	try {
		if (!requestBody) throw new Error('Event Body Generation Failed')
		if (!isEventEnabled(eventGroup)) throw new Error(`Events Not Enabled For The Group "${eventGroup}"`)
		if (isInternal) headers.internal_access_token = process.env.INTERNAL_ACCESS_TOKEN
		const endPoints = getEndpoints(eventGroup)
		const requestPromises = endPoints.map((endPoint) => {
			return requester.post(endPoint, '', headers, requestBody)
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
