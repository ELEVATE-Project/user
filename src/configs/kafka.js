/**
 * name : kafka.js
 * author : Rakesh Kumar
 * Date : 03-Nov-2021
 * Description : Contains kafk connection
 */

//Dependencies
const { Kafka } = require('kafkajs')
const emailNotifications = require('@generics/helpers/email-notifications')
const { elevateLog } = require('elevate-logger')
const logger = elevateLog.init()
module.exports = async function (config) {
	const kafkaIps = process.env.KAFKA_HOST.split(',')
	const KafkaClient = new Kafka({
		clientId: 'mentoring',
		brokers: kafkaIps,
	})

	const producer = KafkaClient.producer()
	const consumer = KafkaClient.consumer({ groupId: process.env.KAFKA_GROUP_ID })

	await producer.connect()
	await consumer.connect()

	producer.on('producer.connect', () => {
		logger.info(`KafkaProvider: connected`)
	})
	producer.on('producer.disconnect', () => {
		logger.error(`KafkaProvider: could not connect`)
	})

	const subscribeToConsumer = async () => {
		await consumer.subscribe({ topics: [process.env.KAFKA_TOPIC] })
		await consumer.run({
			eachMessage: async ({ topic, partition, message }) => {
				try {
					let notificationData = JSON.parse(message.value)
					if (notificationData.type == 'email' && notificationData.email) {
						emailNotifications.sendEmail(notificationData.email)
					}
				} catch (error) {
					logger.error('failed', error)
				}
			},
		})
	}
	subscribeToConsumer()

	global.kafkaClient = {
		kafkaProducer: producer,
		kafkaClient: KafkaClient,
	}
}
