const { RedisConfig, InternalCache } = require('elevate-node-cache')
module.exports = () => {
	RedisConfig.config(process.env.REDIS_HOST)
}
