const { RedisConfig, InternalCache, RedisHelper } = require('elevate-node-cache')
module.exports = () => {
	RedisConfig.config(process.env.REDIS_HOST)
	InternalCache.init(process.env.INTERNAL_CACHE_EXP_TIME)
	RedisHelper.init(process.env.REDIS_CACHE_EXP_TIME)
}
