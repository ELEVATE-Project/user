/**
 * name : generics/kafka-communication
 * author : Aman Gupta
 * Date : 08-Nov-2021
 * Description : Kafka producer methods
 */

const pushEmailToKafka = async (message) => {
	try {
		const payload = [{ topic: process.env.NOTIFICATION_KAFKA_TOPIC, messages: JSON.stringify(message) }]
		return await pushPayloadToKafka(payload)
	} catch (error) {
		throw error
	}
}

const pushPayloadToKafka = async (payload) => {
	kafkaProducer.send(payload, (error, data) => {
		if (error) {
			return error
		}
		return data
	})
}

module.exports = {
	pushEmailToKafka,
}
