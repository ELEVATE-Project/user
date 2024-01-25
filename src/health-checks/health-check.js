/**
 * name : healthCheckService.js.
 * author : Aman Karki.
 * created-date : 17-Dec-2021.
 * Description : Health check service helper functionality.
 */

// Dependencies

const { v1: uuidv1 } = require('uuid')
const userHealthCheck = require('./user')
const kafkaHealthCheck = require('./kafka')

const obj = {
	USER_SERVICE: {
		NAME: 'userservice.api',
		FAILED_CODE: 'USER_SERVICE_HEALTH_FAILED',
		FAILED_MESSAGE: 'User service is not healthy',
	},
	KAFKA: {
		NAME: 'kafka',
		FAILED_CODE: 'KAFKA_HEALTH_FAILED',
		FAILED_MESSAGE: 'Kafka is not connected',
	},
	NAME: 'MentoringServiceHealthCheck',
	API_VERSION: '1.0',
}

let health_check = async function (req, res) {
	let checks = []
	let userServiceStatus = await userHealthCheck.health_check()
	let kafkaServiceStatus = await kafkaHealthCheck.health_check()

	checks.push(checkResult('KAFKA', kafkaServiceStatus))
	checks.push(checkResult('USER_SERVICE', userServiceStatus))

	let checkServices = checks.filter((check) => check.healthy === false)

	let result = {
		name: obj.NAME,
		version: obj.API_VERSION,
		healthy: checkServices.length > 0 ? false : true,
		checks: checks,
	}

	let responseData = response(req, result)
	res.status(200).json(responseData)
}

let checkResult = function (serviceName, isHealthy) {
	return {
		name: obj[serviceName].NAME,
		healthy: isHealthy,
		err: !isHealthy ? obj[serviceName].FAILED_CODE : '',
		errMsg: !isHealthy ? obj[serviceName].FAILED_MESSAGE : '',
	}
}

let healthCheckStatus = function (req, res) {
	let responseData = response(req)
	res.status(200).json(responseData)
}

let response = function (req, result = {}) {
	return {
		id: 'mentoringService.Health.API',
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
	healthCheckStatus: healthCheckStatus,
	health_check: health_check,
}
