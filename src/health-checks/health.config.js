/**
 * name : health.config.js.
 * author : Mallanagouda R Biradar
 * created-date : 30-Jun-2025
 * Description : Health check config file
 */

module.exports = {
	name: process.env.SERVICE_NAME,
	version: '1.0.0',
	checks: {
		kafka: {
			enabled: true,
			url: process.env.KAFKA_URL,
			topic: process.env.KAFKA_HEALTH_CHECK_TOPIC,
		},
		redis: {
			enabled: true,
			url: process.env.REDIS_HOST,
		},
		postgres: {
			enabled: true,
			url: process.env.DEV_DATABASE_URL,
		},
		microservices: [
			{
				name: 'EntityManagementService',
				url: `${process.env.INTERFACE_SERVICE_HOST}/entity-management/health?serviceName=${process.env.SERVICE_NAME}`,
				enabled: true,
				request: {
					method: 'GET',
					header: {},
					body: {},
				},

				expectedResponse: {
					status: 200,
					'params.status': 'successful',
					'result.healthy': true,
				},
			},
			{
				name: 'SchedulerService',
				url: `${process.env.INTERFACE_SERVICE_HOST}/scheduler/health?serviceName=${process.env.SERVICE_NAME}`,
				enabled: true,
				request: {
					method: 'GET',
					header: {},
					body: {},
				},

				expectedResponse: {
					status: 200,
					'params.status': 'successful',
					'result.healthy': true,
				},
			},
		],
	},
}
