/**
 * name : generics/kafka-communication
 * author : Aman Gupta
 * Date : 08-Nov-2021
 * Description : Kafka producer methods
 */

const pushEmailToKafka = async (message) => {
	try {
		const payload = { topic: process.env.NOTIFICATION_KAFKA_TOPIC, messages: [{ value: JSON.stringify(message) }] }
		return await pushPayloadToKafka(payload)
	} catch (error) {
		console.log(error)
		return error
	}
}

const pushUserEventsToKafka = async (message) => {
	try {
		console.log('📤 [USER KAFKA PRODUCER] ===== KAFKA USER EVENT DETAILS =====')
		console.log('📤 [USER KAFKA PRODUCER] Target Topic:', process.env.EVENT_USER_KAFKA_TOPIC)
		console.log('📤 [USER KAFKA PRODUCER] Kafka Producer Status:', kafkaProducer ? 'Connected' : 'Not Connected')
		console.log('📤 [USER KAFKA PRODUCER] Message Details:')
		console.log('📤 [USER KAFKA PRODUCER]   Entity:', message.entity)
		console.log('📤 [USER KAFKA PRODUCER]   Event Type:', message.eventType)
		console.log('📤 [USER KAFKA PRODUCER]   Entity ID:', message.entityId)
		console.log('📤 [USER KAFKA PRODUCER]   Tenant Code:', message.tenant_code)
		console.log('📤 [USER KAFKA PRODUCER]   Created By:', message.created_by)
		console.log('📤 [USER KAFKA PRODUCER]   Organizations:', message.organizations?.length || 0, 'orgs')
		
		const messageString = JSON.stringify(message)
		console.log('📤 [USER KAFKA PRODUCER] Payload Size:', messageString.length, 'bytes')
		console.log('📤 [USER KAFKA PRODUCER] First 200 chars:', messageString.substring(0, 200) + '...')
		
		const payload = { topic: process.env.EVENT_USER_KAFKA_TOPIC, messages: [{ value: messageString }] }
		console.log('📤 [USER KAFKA PRODUCER] Kafka Payload Prepared:')
		console.log('📤 [USER KAFKA PRODUCER]   Topic:', payload.topic)
		console.log('📤 [USER KAFKA PRODUCER]   Messages Count:', payload.messages.length)
		
		console.log('📤 [USER KAFKA PRODUCER] Sending to Kafka...')
		const response = await pushPayloadToKafka(payload)
		
		console.log('📤 [USER KAFKA PRODUCER] ✅ Kafka Response Received:')
		console.log('📤 [USER KAFKA PRODUCER]   Success:', response ? 'Yes' : 'No')
		if (response && response[0]) {
			console.log('📤 [USER KAFKA PRODUCER]   Topic:', response[0].topicName)
			console.log('📤 [USER KAFKA PRODUCER]   Partition:', response[0].partition)
			console.log('📤 [USER KAFKA PRODUCER]   Offset:', response[0].baseOffset)
		}
		console.log('📤 [USER KAFKA PRODUCER] ===== KAFKA USER EVENT COMPLETED =====')
		
		return response
	} catch (error) {
		console.log('📤 [USER KAFKA PRODUCER] ❌ ERROR in pushUserEventsToKafka:', error.message)
		console.log('📤 [USER KAFKA PRODUCER] ❌ Error stack:', error.stack)
		return error
	}
}

const pushTenantEventsToKafka = async (message) => {
	try {
		const payload = { topic: process.env.EVENT_TENANT_KAFKA_TOPIC, messages: [{ value: JSON.stringify(message) }] }
		return await pushPayloadToKafka(payload)
	} catch (error) {
		console.log(error)
		return error
	}
}

const pushOrganizationEventsToKafka = async (message) => {
	try {
		const payload = {
			topic: process.env.EVENT_ORGANIZATION_KAFKA_TOPIC,
			messages: [{ value: JSON.stringify(message) }],
		}
		return await pushPayloadToKafka(payload)
	} catch (error) {
		console.log(error)
		return error
	}
}

const pushPayloadToKafka = async (payload) => {
	try {
		console.log('📤 [KAFKA PRODUCER] ===== SENDING PAYLOAD TO KAFKA =====')
		console.log('📤 [KAFKA PRODUCER] Producer Ready:', !!kafkaProducer)
		console.log('📤 [KAFKA PRODUCER] Payload Topic:', payload.topic)
		console.log('📤 [KAFKA PRODUCER] Message Count:', payload.messages.length)
		console.log('📤 [KAFKA PRODUCER] Kafka Brokers:', process.env.KAFKA_URL || 'Not configured')
		
		console.log('📤 [KAFKA PRODUCER] Calling kafkaProducer.send()...')
		const startTime = Date.now()
		let response = await kafkaProducer.send(payload)
		const endTime = Date.now()
		
		console.log('📤 [KAFKA PRODUCER] ✅ Kafka Send Completed:')
		console.log('📤 [KAFKA PRODUCER]   Duration:', endTime - startTime, 'ms')
		console.log('📤 [KAFKA PRODUCER]   Response Type:', typeof response)
		console.log('📤 [KAFKA PRODUCER]   Response Array Length:', Array.isArray(response) ? response.length : 'Not an array')
		
		if (response && Array.isArray(response) && response.length > 0) {
			response.forEach((result, index) => {
				console.log(`📤 [KAFKA PRODUCER]   Result ${index}:`)
				console.log(`📤 [KAFKA PRODUCER]     Topic: ${result.topicName}`)
				console.log(`📤 [KAFKA PRODUCER]     Partition: ${result.partition}`)
				console.log(`📤 [KAFKA PRODUCER]     Base Offset: ${result.baseOffset}`)
				console.log(`📤 [KAFKA PRODUCER]     Log Start Offset: ${result.logStartOffset}`)
			})
		}
		console.log('📤 [KAFKA PRODUCER] ===== KAFKA SEND COMPLETED =====')
		
		return response
	} catch (error) {
		console.log('📤 [KAFKA PRODUCER] ❌ ERROR in pushPayloadToKafka:', error.message)
		console.log('📤 [KAFKA PRODUCER] ❌ Error details:', {
			name: error.name,
			code: error.code,
			stack: error.stack?.split('\n').slice(0, 3).join('\n')
		})
		return error
	}
}

const clearInternalCache = async (key) => {
	try {
		const payload = {
			topic: process.env.CLEAR_INTERNAL_CACHE,
			messages: [{ value: JSON.stringify({ value: key, type: 'CLEAR_INTERNAL_CACHE' }) }],
		}

		return await pushPayloadToKafka(payload)
	} catch (error) {
		throw error
	}
}

module.exports = {
	pushEmailToKafka,
	clearInternalCache,
	pushUserEventsToKafka,
	pushTenantEventsToKafka,
	pushOrganizationEventsToKafka,
}
