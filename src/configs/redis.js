const redis = require('redis')

const { elevateLog } = require('elevate-logger')
const logger = elevateLog.init()

module.exports = async function () {
	const redisClient = redis.createClient({ url: process.env.REDIS_HOST })

	try {
		await redisClient.connect()
	} catch (error) {
		logger.error('Error while making connection to redis client: ', {
			triggerNotification: true,
			err: error,
		})
	}

	redisClient.on('error', (err) => {
		logger.error('Error while making connection to redis client: ', {
			triggerNotification: true,
			error: err,
		})
	})

	global.redisClient = redisClient
}
