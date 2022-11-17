/**
 * name : kafka.js.
 * author : Aman Karki.
 * created-date : 17-Dec-2021.
 * Description : kafka health check.
 */

// Dependencies
const kafka = require('kafkajs')

function health_check() {
	return new Promise(async (resolve, reject) => {
		const kafkaIps = process.env.KAFKA_URL.split(',')
		const KafkaClient = new Kafka({
			clientId: 'mentoring',
			brokers: kafkaIps,
		})

		const producer = KafkaClient.producer()
		await producer.connect()

		producer.on('producer.connect', () => {
			console.log(`KafkaProvider: connected`)
			return resolve(true)
		})
		producer.on('producer.disconnect', () => {
			console.log(`KafkaProvider: could not connect`)
			return resolve(false)
		})
	})
}

module.exports = {
	health_check: health_check,
}
