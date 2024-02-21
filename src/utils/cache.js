const { RedisCache, InternalCache } = require('elevate-node-cache')

const generateRedisConfigForQueue = () => {
	const parseURL = new URL(process.env.REDIS_HOST)
	return {
		connection: {
			host: parseURL.hostname,
			port: parseURL.port,
		},
	}
}

const internalSet = function (key, value) {
	return InternalCache.setKey(key, value)
}

const internalGet = function (key) {
	return InternalCache.getKey(key)
}

const internalDel = function (key) {
	return InternalCache.delKey(key)
}

const redisSet = function (key, value, exp) {
	return RedisCache.setKey(key, value, exp)
}

const redisGet = function (key) {
	return RedisCache.getKey(key)
}

const redisDel = function (key) {
	return RedisCache.deleteKey(key)
}

const cache = {
	generateRedisConfigForQueue,
	internalSet,
	internalGet,
	internalDel,
	redisSet,
	redisGet,
	redisDel,
}

module.exports = cache
