/**
 * name : health.config.js.
 * author : Mallanagouda R Biradar
 * created-date : 30-Jun-2025
 * Description : Health check config file
 */

module.exports = {
	name: 'UserService',
	version: '1.0.0',
	checks: {
		mongodb: {
			enabled: true,
			url: process.env.MONGODB_URL,
		},
		kafka: {
			enabled: true,
			url: process.env.KAFKA_URL,
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
				url: 'http://localhost:3569/entity/health?serviceName=UserService', // Replace with actual URL - use environment variable if needed
				enabled: true,

				request: {
					method: 'GET',
					header: {
						'internal-access-token': process.env.INTERNAL_TOKEN,
					},
					body: {},
				},

				expectedResponse: {
					status: 200,
					'params.status': 'successful',
				},
			},
		],
	},
}
