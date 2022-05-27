const redis = require('redis')

module.exports = async function () {
	const redisClient = redis.createClient({ url: process.env.REDIS_HOST })

	try {
		await redisClient.connect()
	} catch (error) {
		console.log('Error while making connection to redis client: ', error)
	}

	redisClient.on('error', (err) => {
		console.log('Error while making connection to redis client: ', err)
	})

	global.redisClient = redisClient
}
