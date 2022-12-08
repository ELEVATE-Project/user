const redis = require('redis')
const { logger } = require('@log/logger')
module.exports = async function () {
	const redisClient = redis.createClient({ url: process.env.REDIS_HOST })

	try {
		await redisClient.connect()
	} catch (error) {
		logger.info('Error while making connection to redis client: ', error)
	}

	redisClient.on('error', (err) => {
		logger.info('Error while making connection to redis client: ', err)
	})

	global.redisClient = redisClient
}
