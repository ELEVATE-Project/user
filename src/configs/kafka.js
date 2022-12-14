/**
 * name : configs/kafka
 * author : Aman Gupta
 * Date : 08-Nov-2021
 * Description : Kafka connection configurations
 */

//Dependencies
const { Kafka } = require('kafkajs')

const utils = require('@generics/utils')
const profileService = require('@services/helper/profile')

module.exports = async () => {
	const kafkaIps = process.env.KAFKA_URL.split(',')
	const KafkaClient = new Kafka({
		clientId: 'mentoring',
		brokers: kafkaIps,
	})

	const producer = KafkaClient.producer()
	const consumer = KafkaClient.consumer({ groupId: process.env.KAFKA_GROUP_ID })

	await producer.connect()
	await consumer.connect()

	producer.on('producer.connect', () => {
		console.log(`KafkaProvider: connected`)
	})
	producer.on('producer.disconnect', () => {
		console.log(`KafkaProvider: could not connect`)
	})

	const subscribeToConsumer = async () => {
		await consumer.subscribe({ topics: [process.env.RATING_KAFKA_TOPIC, process.env.CLEAR_INTERNAL_CACHE] })
		await consumer.run({
			eachMessage: async ({ topic, partition, message }) => {
				try {
					let streamingData = JSON.parse(message.value)
					if (streamingData.type == 'MENTOR_RATING' && streamingData.value && streamingData.mentorId) {
						profileService.ratingCalculation(streamingData)
					} else if (streamingData.type == 'CLEAR_INTERNAL_CACHE') {
						utils.internalDel(streamingData.value)
					}
				} catch (error) {
					console.log('failed', error)
				}
			},
		})
	}
	subscribeToConsumer()

	global.kafkaProducer = producer
	global.kafkaClient = KafkaClient
}
