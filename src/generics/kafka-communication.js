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
		throw error
	}
}

const pushMentorRatingToKafka = async (message) => {
	try {
		const payload = { topic: process.env.RATING_KAFKA_TOPIC, messages: [{ value: JSON.stringify(message) }] }
		return await pushPayloadToKafka(payload)
	} catch (error) {
		throw error
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

const pushPayloadToKafka = (payload) => {
	return new Promise(async function (resolve, reject) {
		let response = await kafkaProducer.send(payload)
		if (response) {
			resolve(response)
		} else {
			reject(false)
		}
	})
}

module.exports = {
	pushEmailToKafka,
	pushMentorRatingToKafka,
	clearInternalCache,
}
