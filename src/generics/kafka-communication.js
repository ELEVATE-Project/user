/**
 * name : generics/kafka-communication
 * author : Aman Gupta
 * Date : 08-Nov-2021
 * Description : Kafka producer methods
 */

const { logger, correlationId } = require('elevate-logger')
const pushEmailToKafka = async (message) => {
	try {
		const payload = [{ topic: process.env.NOTIFICATION_KAFKA_TOPIC, messages: JSON.stringify(message) }]
		return await pushPayloadToKafka(payload)
	} catch (error) {
		throw error
	}
}

const pushPayloadToKafka = (payload) => {
	return new Promise((resolve, reject) => {
		kafkaProducer.send(payload, (error, data) => {
			if (error) {
				reject(error)
			}
			resolve(data)
		})
	})
}

const clearInternalCache = async (key) => {
	try {
		const payload = [
			{
				topic: process.env.CLEAR_INTERNAL_CACHE,
				messages: JSON.stringify({ value: key, type: 'CLEAR_INTERNAL_CACHE' }),
			},
		]
		return await pushPayloadToKafka(payload)
	} catch (error) {
		throw error
	}
}

module.exports = {
	pushEmailToKafka,
	clearInternalCache,
}
