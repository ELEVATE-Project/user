/**
 * name : configs
 * author : Aman Kumar Gupta
 * Date : 31-Sep-2021
 * Description : Contains connections of all configs
 */

require('./mongodb')()

require('./kafka')()

const { RedisConfig } = require('elevate-node-cache')
RedisConfig.config(process.env.REDIS_HOST)
