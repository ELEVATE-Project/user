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
		const response = await healthCheckHandler(healthCheckConfig, req.query.basicCheck, req.query.serviceName)
		res.status(200).json(response)
	} catch (err) {
		console.error('Health config validation failed:', err.message || err)
		res.status(400).json({
			id: 'userService.Health.API',
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

module.exports = {
	health_check: health_check,
	healthCheckStatus: healthCheckStatus,
}
