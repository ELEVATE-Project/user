/**
 * name : healthCheckService.js.
 * author : Aman Karki.
 * created-date : 17-Dec-2021.
 * Description : Health check helper functionality.
 */

// Dependencies
const { healthCheckHandler } = require('elevate-services-health-check')
const healthCheckConfig = require('./health.config')
const { v1: uuidv1 } = require('uuid')

let health_check = async function (req, res) {
	try {
		validateHealthConfig(healthCheckConfig)
		const response = await healthCheckHandler(healthCheckConfig, req.query.basicCheck, req.query.serviceName)
		res.status(200).json(response)
	} catch (err) {
		console.error('Health config validation failed:', err.message || err)
		res.status(400).json({
			id: 'mentoringService.Health.API',
			ver: '1.0',
			ts: new Date(),
			params: {
				resmsgid: uuidv1(),
				msgid: req.headers['msgid'] || req.headers.msgid || uuidv1(),
				status: 'failed',
				err: 'CONFIG_VALIDATION_ERROR',
				errMsg: err.message || 'Invalid config',
			},
			status: 400,
			result: {},
		})
	}
}

let healthCheckStatus = function (req, res) {
	let responseData = response(req)
	res.status(200).json(responseData)
}

let response = function (req, result) {
	return {
		id: 'User.service.Health.API',
		ver: '1.0',
		ts: new Date(),
		params: {
			resmsgid: uuidv1(),
			msgid: req.headers['msgid'] || req.headers.msgid || uuidv1(),
			status: 'successful',
			err: 'null',
			errMsg: 'null',
		},
		status: 200,
		result: result,
	}
}

function validateHealthConfig(config) {
	if (!config.checks) {
		throw new Error('Health config must include a `checks` object')
	}

	const { kafka, postgres, redis, microservices } = config.checks

	const basicServices = [
		{ name: 'kafka', value: kafka },
		{ name: 'postgres', value: postgres },
		{ name: 'redis', value: redis },
	]

	for (const { name, value } of basicServices) {
		if (value?.enabled && !value.url) {
			throw new Error(`Missing 'url' for enabled service: ${name}`)
		}
	}

	if (Array.isArray(microservices)) {
		microservices.forEach((service, index) => {
			if (service.enabled) {
				const missingKeys = []
				if (!service.name) missingKeys.push('name')
				if (!service.url) missingKeys.push('url')
				if (!service.request) missingKeys.push('request')
				if (!service.expectedResponse) missingKeys.push('expectedResponse')

				if (missingKeys.length > 0) {
					throw new Error(
						`Missing required fields for enabled microservice at index ${index}: ${missingKeys.join(', ')}`
					)
				}
			}
		})
	}
}

module.exports = {
	health_check: health_check,
	healthCheckStatus: healthCheckStatus,
}
