/**
 * name : configs/kafka
 * author : Aman Gupta
 * Date : 08-Nov-2021
 * Description : Kafka connection configurations
 */

//Dependencies
const Kafka = require('kafka-node')
const utils = require('@generics/utils')
const profileService = require('@services/helper/profile')
const { elevateLog } = require('elevate-logger')
const logger = elevateLog.init()
module.exports = () => {
	const Producer = Kafka.Producer
	const KafkaClient = new Kafka.KafkaClient({
		kafkaHost: process.env.KAFKA_URL,
	})
	const producer = new Producer(KafkaClient)

	/* Uncomment while writing consuming actions for this service */
	// const Consumer = Kafka.Consumer;
	// const consumer = new Consumer(KafkaClient, [ { topic: process.env.RATING_TOPIC } ], { autoCommit: true, groupId: process.env.KAFKA_GROUP_ID })

	/* Registered events */

	KafkaClient.on('error', (error) => {
		logger.error('Kafka connection error: ', error)
	})

	KafkaClient.on('connect', () => {
		logger.info('Connected to kafka client')
	})

	producer.on('error', (error) => {
		logger.error('Kafka producer initialization error: ', error)
	})

	producer.on('ready', () => {
		logger.info('Producer initialized successfully')
	})

	const consumer = new Kafka.ConsumerGroup(
		{
			kafkaHost: process.env.KAFKA_URL,
			groupId: process.env.KAFKA_GROUP_ID,
			autoCommit: true,
		},
		[process.env.RATING_KAFKA_TOPIC, process.env.CLEAR_INTERNAL_CACHE]
	)

	consumer.on('message', async function (message) {
		try {
			let streamingData = JSON.parse(message.value)
			if (streamingData.type == 'MENTOR_RATING' && streamingData.value && streamingData.mentorId) {
				profileService.ratingCalculation(streamingData)
			} else if (streamingData.type == 'CLEAR_INTERNAL_CACHE') {
				utils.internalDel(streamingData.value)
			}
		} catch (error) {
			logger.error('failed', error)
		}
	})

	consumer.on('error', async function (error) {
		logger.error('kafka consumer initialization error', error)
	})

	global.kafkaProducer = producer
	global.kafkaClient = KafkaClient
}
