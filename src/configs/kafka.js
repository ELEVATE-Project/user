/**
 * name : configs/kafka
 * author : Aman Gupta
 * Date : 08-Nov-2021
 * Description : Kafka connection configurations
 */

//Dependencies
const { Kafka } = require('kafkajs')

const utils = require('@generics/utils')

const { elevateLog } = require('elevate-logger')
const logger = elevateLog.init()

module.exports = async () => {
	console.log('🚀 [USER SERVICE KAFKA] ===== STARTING KAFKA CONFIGURATION =====')
	console.log('🚀 [USER SERVICE KAFKA] Environment variables:')
	console.log('🚀 [USER SERVICE KAFKA]   KAFKA_URL:', process.env.KAFKA_URL)
	console.log('🚀 [USER SERVICE KAFKA]   KAFKA_GROUP_ID:', process.env.KAFKA_GROUP_ID)
	console.log('🚀 [USER SERVICE KAFKA]   EVENT_USER_KAFKA_TOPIC:', process.env.EVENT_USER_KAFKA_TOPIC)
	console.log('🚀 [USER SERVICE KAFKA]   CLEAR_INTERNAL_CACHE:', process.env.CLEAR_INTERNAL_CACHE)
	
	const kafkaIps = process.env.KAFKA_URL.split(',')
	console.log('🚀 [USER SERVICE KAFKA] Kafka brokers:', kafkaIps)
	
	const KafkaClient = new Kafka({
		clientId: 'user-service',
		brokers: kafkaIps,
	})

	console.log('🚀 [USER SERVICE KAFKA] Creating producer and consumer...')
	const producer = KafkaClient.producer()
	const consumer = KafkaClient.consumer({ groupId: process.env.KAFKA_GROUP_ID })

	console.log('🚀 [USER SERVICE KAFKA] Connecting producer...')
	await producer.connect()
	console.log('🚀 [USER SERVICE KAFKA] ✅ Producer connected successfully')

	console.log('🚀 [USER SERVICE KAFKA] Connecting consumer...')
	await consumer.connect()
	console.log('🚀 [USER SERVICE KAFKA] ✅ Consumer connected successfully')

	producer.on('producer.connect', () => {
		logger.info(`KafkaProvider: connected`)
		console.log('🚀 [USER SERVICE KAFKA] Producer event: connected')
	})
	producer.on('producer.disconnect', () => {
		logger.error(`KafkaProvider: could not connect`, {
			triggerNotification: true,
		})
		console.log('🚀 [USER SERVICE KAFKA] Producer event: disconnected')
	})

	const subscribeToConsumer = async () => {
		console.log('🚀 [USER SERVICE KAFKA] Setting up consumer subscriptions...')
		const topics = [process.env.CLEAR_INTERNAL_CACHE].filter(Boolean)
		console.log('🚀 [USER SERVICE KAFKA] Subscribing to topics:', topics)
		
		await consumer.subscribe({ topics })
		await consumer.run({
			eachMessage: async ({ topic, partition, message }) => {
				try {
					console.log('🚀 [USER SERVICE KAFKA] Cache clear message received:', {
						topic,
						partition,
						offset: message.offset
					})
					let streamingData = JSON.parse(message.value)
					if (streamingData.type == 'CLEAR_INTERNAL_CACHE') {
						console.log('🚀 [USER SERVICE KAFKA] Processing cache clear for:', streamingData.value)
						utils.internalDel(streamingData.value)
					}
				} catch (error) {
					console.log('🚀 [USER SERVICE KAFKA] ❌ Consumer error:', error.message)
					logger.error('Subscribe to consumer failed:' + error, {
						triggerNotification: true,
					})
				}
			},
		})
	}
	
	console.log('🚀 [USER SERVICE KAFKA] Starting consumer subscriptions...')
	subscribeToConsumer()

	console.log('🚀 [USER SERVICE KAFKA] Setting global variables...')
	global.kafkaProducer = producer
	global.kafkaClient = KafkaClient
	
	console.log('🚀 [USER SERVICE KAFKA] ===== KAFKA CONFIGURATION COMPLETED =====')
}
