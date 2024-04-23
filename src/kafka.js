const { Kafka } = require('kafkajs')

const kafka = new Kafka({
	clientId: 'my-app',
	brokers: ['127.0.0.1:9095', '127.0.0.1:9093', '127.0.0.1:9094'],
})

const producer = kafka.producer()
const consumer = kafka.consumer({
	groupId: 'test-group',
	retry: {
		// Try to reconnect after 10seg
		initialRetryTime: 10 * 1000,
		retries: 10,
	},
})

const run = async () => {
	await producer.connect()
	await producer.send({
		topic: 'my-kafka-topic',
		messages: [{ value: 'Hello KafkaJS user!' }],
	})

	try {
		async function consumerLoad() {
			console.log('connecting to consumer')

			await consumer.connect()
			await consumer.subscribe({ topics: ['my-kafka-topic4'] })

			await consumer.run({
				eachMessage: async ({ topic, partition, message }) => {
					console.log('message', message.value.toString())
				},
			})
		}
		consumerLoad()

		consumer.on('consumer.crash', async (event) => {
			const error = event?.payload?.error
			// crashHandler(error)
			// await consumer.restartConsumer()
			consumerLoad()
			console.log('=================', error)
		})
		//  function crashHandler(error) {
		//   console.log("crashhandler",error);
		//   // This logic is based on kafkajs implementation: https://github.com/tulios/kafkajs/blob/master/src/consumer/index.js#L257
		//   if (error && error.name !== 'KafkaJSNumberOfRetriesExceeded' && error.retriable !== true) {
		//     // await consumer.resume();
		//   }
		// }
	} catch (error) {
		console.log('===================', error)
	}

	// Consuming
}

run().catch(console.log('--------', console.error))
