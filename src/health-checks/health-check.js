/**
 * name : healthCheckService.js.
 * author : Aman Karki.
 * created-date : 17-Dec-2021.
 * Description : Health check helper functionality.
 */

// Dependencies
const { healthCheckHandler } = require('elevate-services-health-check')
const healthCheckConfig = require('./health.config')

let health_check = async function (req, res) {
	const response = await healthCheckHandler(healthCheckConfig, req.query.serviceName)
	res.status(200).json(response)
}

let healthCheckStatus = function (req, res) {
	let responseData = response(req)
	res.status(200).json(responseData)
} // enabled:process.env.NODE_ENV !== 'development',

let response = function (req, result) {
	return {
		id: 'Project.service.Health.API',
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
