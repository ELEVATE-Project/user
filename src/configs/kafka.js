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
		console.log('Kafka connection error: ', error)
	})

	KafkaClient.on('connect', () => {
		console.log('Connected to kafka client')
	})

	producer.on('error', (error) => {
		console.log('Kafka producer intialization error: ', error)
	})

	producer.on('ready', () => {
		console.log('Producer intialized successfully')
	})

	const consumer = new Kafka.ConsumerGroup(
		{
			kafkaHost: process.env.KAFKA_URL,
			groupId: process.env.KAFKA_GROUP_ID,
			autoCommit: true,
		},
		process.env.RATING_KAFKA_TOPIC
	)

	const internalConsumer = new Kafka.ConsumerGroup(
		{
			kafkaHost: process.env.KAFKA_URL,
			groupId: process.env.KAFKA_GROUP_ID,
			autoCommit: true,
		},
		process.env.INTERNAL_CACHE_UPDATE
	)
	consumer.on('message', async function (message) {
		try {
			let streamingData = JSON.parse(message.value)
			if (streamingData.type == 'MENTOR_RATING' && streamingData.value && streamingData.mentorId) {
				profileService.ratingCalculation(streamingData)
			}
		} catch (error) {
			console.log('failed', error)
		}
	})

	internalConsumer.on('message', async function (message) {
		try {
			let internalData = JSON.parse(message.value)
			if (internalData.type == 'INTERNAL_CACHE_UPDATE') {
				utils.internalDel(internalData.value)
			}
		} catch (error) {
			console.log('failed', error)
		}
	})

	internalConsumer.on('error', async function (error) {
		console.log('kafka consumer intialization error', error)
	})
	consumer.on('error', async function (error) {
		console.log('kafka consumer intialization error', error)
	})

	global.kafkaProducer = producer
	global.kafkaClient = KafkaClient
}
