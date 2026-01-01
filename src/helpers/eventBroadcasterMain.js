'use strict'
const requester = require('@utils/requester')
const kafkaCommunication = require('@generics/kafka-communication')
const util = require('util')

const getEndpoints = (eventGroup) => {
	switch (eventGroup) {
		case 'organizationEvents':
			if (process.env.EVENT_ORG_LISTENER_URLS)
				return process.env.EVENT_ORG_LISTENER_URLS.split(',').filter((url) => url.trim())
			return []
		case 'userEvents':
			if (process.env.EVENT_USER_LISTENER_API)
				return process.env.EVENT_USER_LISTENER_API.split(',').filter((url) => url.trim())
			return []
		case 'tenantEvents':
			if (process.env.EVENT_TENANT_LISTENER_API)
				return process.env.EVENT_TENANT_LISTENER_API.split(',').filter((url) => url.trim())
			return []
		default:
			return []
	}
}

const isEventEnabled = (eventGroup) => {
	console.log(`[EVENT BROADCASTER] Checking if event enabled for group: ${eventGroup}`)
	console.log(`[EVENT BROADCASTER] Environment variables:`)
	console.log(`  EVENT_ENABLE_USER_EVENTS: ${process.env.EVENT_ENABLE_USER_EVENTS}`)
	console.log(`  EVENT_ENABLE_USER_KAFKA_EVENTS: ${process.env.EVENT_ENABLE_USER_KAFKA_EVENTS}`)
	console.log(`  EVENT_USER_LISTENER_API: ${process.env.EVENT_USER_LISTENER_API}`)
	console.log(`  EVENT_USER_KAFKA_TOPIC: ${process.env.EVENT_USER_KAFKA_TOPIC}`)
	
	switch (eventGroup) {
		case 'organizationEvents':
			return process.env.EVENT_ENABLE_ORG_EVENTS !== 'false'
		case 'userEvents':
			const apiEnabled = process.env.EVENT_ENABLE_USER_EVENTS !== 'false'
			console.log(`[EVENT BROADCASTER] API events enabled for userEvents: ${apiEnabled}`)
			return apiEnabled
		case 'tenantEvents':
			return process.env.EVENT_ENABLE_TENANT_EVENTS !== 'false'
		case 'userEvents-kafka':
			const kafkaEnabled = process.env.EVENT_ENABLE_USER_KAFKA_EVENTS !== 'false'
			console.log(`[EVENT BROADCASTER] Kafka events enabled for userEvents: ${kafkaEnabled}`)
			return kafkaEnabled
		case 'tenantEvents-kafka':
			return process.env.EVENT_ENABLE_TENANT_KAFKA_EVENTS !== 'false'
		case 'organizationEvents-kafka':
			return process.env.EVENT_ENABLE_ORG_KAFKA_EVENTS !== 'false'
		default:
			return true
	}
}

exports.eventBroadcasterMain = async (eventGroup, { requestBody, headers = {}, isInternal = true }) => {
	try {
		console.log(`[EVENT BROADCASTER] API Event starting for group: ${eventGroup}`)
		if (!requestBody) throw new Error('Event Body Generation Failed')
		if (!isEventEnabled(eventGroup)) throw new Error(`Events Not Enabled For The Group "${eventGroup}"`)
		if (isInternal) headers.internal_access_token = process.env.INTERNAL_ACCESS_TOKEN
		const endPoints = getEndpoints(eventGroup)
		console.log(`[EVENT BROADCASTER] API endpoints found: ${JSON.stringify(endPoints)}`)
		const requestPromises = endPoints.map((endPoint) => {
			console.log(`[EVENT BROADCASTER] Making HTTP request to: ${endPoint}`)
			return requester.post(endPoint, '', headers, requestBody)
		})
		const results = await Promise.allSettled(requestPromises)
		console.log(`[EVENT BROADCASTER] API Event results: ${JSON.stringify(results)}`)
		results.forEach((result, index) => {
			if (result.status === 'rejected')
				console.error(`Error for endpoint ${endPoints[index].url}:`, result.reason)
		})
	} catch (err) {
		console.log(`[EVENT BROADCASTER] API Event error: ${err.message}`)
	}
}
exports.eventBroadcasterKafka = async (eventGroup, { requestBody }) => {
	try {
		console.log(`[EVENT BROADCASTER] Kafka Event starting for group: ${eventGroup}`)
		if (!requestBody) throw new Error('Kafka Event Body Generation Failed')
		if (!isEventEnabled(`${eventGroup}-kafka`))
			throw new Error(`Kafka Events Not Enabled For The Group "${eventGroup}"`)
		console.log(`[EVENT BROADCASTER] Kafka Events enabled, pushing to Kafka for group: ${eventGroup}`)
		//push to kafka based on eventGroup
		switch (eventGroup) {
			case 'organizationEvents':
				console.log(`[EVENT BROADCASTER] Pushing organization event to Kafka`)
				await kafkaCommunication.pushOrganizationEventsToKafka(requestBody)
				break
			case 'userEvents':
				console.log(`[EVENT BROADCASTER] Pushing user event to Kafka topic: ${process.env.EVENT_USER_KAFKA_TOPIC}`)
				await kafkaCommunication.pushUserEventsToKafka(requestBody)
				console.log(`[EVENT BROADCASTER] User event pushed to Kafka successfully`)
				break
			case 'tenantEvents':
				console.log(`[EVENT BROADCASTER] Pushing tenant event to Kafka`)
				await kafkaCommunication.pushTenantEventsToKafka(requestBody)
				break
			default:
				console.log('[EVENT BROADCASTER] No Kafka Event Group Found')
				break
		}
	} catch (err) {
		console.log(`[EVENT BROADCASTER] Kafka Event error: ${err.message}`)
	}
}
exports.broadcastEvent = async (eventGroup, { requestBody, headers = {}, isInternal = true }) => {
	try {
		console.log(`[EVENT BROADCASTER] ===== BROADCAST EVENT STARTING =====`)
		console.log(`[EVENT BROADCASTER] Event Group: ${eventGroup}`)
		console.log(`[EVENT BROADCASTER] Request Body: ${util.inspect(requestBody, { depth: null, colors: false, compact: false })}`)

		// Fire both broadcaster functions concurrently
		const broadcastPromises = [
			exports.eventBroadcasterMain(eventGroup, { requestBody, headers, isInternal }),
			exports.eventBroadcasterKafka(eventGroup, { requestBody }),
		]

		console.log(`[EVENT BROADCASTER] Starting both API and Kafka broadcasts concurrently...`)
		// Execute both functions and get their results
		const results = await Promise.allSettled(broadcastPromises)

		// Check for failed promises and throw warnings
		results.forEach((result, index) => {
			if (result.status === 'rejected') {
				const broadcaster = index === 0 ? 'eventBroadcasterMain (API)' : 'eventBroadcasterKafka'
				console.warn(`[EVENT BROADCASTER] Warning: ${broadcaster} failed for eventGroup "${eventGroup}": ${result.reason}`)
			} else {
				const broadcaster = index === 0 ? 'eventBroadcasterMain (API)' : 'eventBroadcasterKafka'
				console.log(`[EVENT BROADCASTER] Success: ${broadcaster} completed for eventGroup "${eventGroup}"`)
			}
		})
		console.log(`[EVENT BROADCASTER] ===== BROADCAST EVENT COMPLETED =====`)
	} catch (err) {
		// Log any unexpected errors from the promise settlement
		console.error('[EVENT BROADCASTER] Error in broadcastEvent:', err)
	}
}
