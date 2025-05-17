'use strict'
const requester = require('@utils/requester')
const kafkaCommunication = require('@generics/kafka-communication')

const getEndpoints = (eventGroup) => {
	switch (eventGroup) {
		case 'organizationEvents':
			if (process.env.EVENT_ORG_LISTENER_URLS)
				return process.env.EVENT_ORG_LISTENER_URLS.split(',').filter((url) => url.trim())
			return []
		case 'userEvents':
			if (process.env.EVENT_USER_LISTENER_API)
				return process.env.EVENT_USER_LISTENER_API.split(',').filter((url) => url.trim())
		default:
			return []
	}
}

const isEventEnabled = (eventGroup) => {
	switch (eventGroup) {
		case 'organizationEvents':
			return process.env.EVENT_ENABLE_ORG_EVENTS !== 'false'

		case 'userEvents':
			return process.env.EVENT_ENABLE_USER_EVENTS !== 'false'

		case 'userEvents-kafka':
			return process.env.EVENT_ENABLE_KAFKA_PUSH !== 'false'
		default:
			return true
	}
}

exports.eventBroadcasterMain = async (eventGroup, { requestBody, headers = {}, isInternal = true }) => {
	try {
		console.log('API Event ')
		if (!requestBody) throw new Error('Event Body Generation Failed')
		if (!isEventEnabled(eventGroup)) throw new Error(`Events Not Enabled For The Group "${eventGroup}"`)
		if (isInternal) headers.internal_access_token = process.env.INTERNAL_ACCESS_TOKEN
		const endPoints = getEndpoints(eventGroup)
		const requestPromises = endPoints.map((endPoint) => {
			return requester.post(endPoint, '', headers, requestBody)
		})
		const results = await Promise.allSettled(requestPromises)
		console.log('PROMISE ------->>> ', results)
		results.forEach((result, index) => {
			if (result.status === 'rejected')
				console.error(`Error for endpoint ${endPoints[index].url}:`, result.reason)
		})
	} catch (err) {
		console.log(err)
	}
}
exports.eventBroadcasterKafka = async (eventGroup, { requestBody }) => {
	try {
		if (!requestBody) throw new Error('Kafka Event Body Generation Failed')
		if (!isEventEnabled(`${eventGroup}-kafka`))
			throw new Error(`Kafka Events Not Enabled For The Group "${eventGroup}"`)

		kafkaCommunication.pushUserEventsToKafka(requestBody)
	} catch (err) {
		console.log(err)
	}
}
