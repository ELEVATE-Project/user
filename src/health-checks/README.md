# Health Check Configuration Guide

This project uses the `elevate-services-health-check` package to perform health checks for internal components like MongoDB, Kafka, and dependent microservices.

To enable this, create a configuration file (`health.config.js`) that defines what to check and how.

---

## ✅ Sample Configuration

```js
module.exports = {
	name: 'UserService', // 🔹 Service name shown in health check response
	version: '1.0.0', // 🔹 Service version shown in response

	checks: {
		postgres: {
			enabled: true, // ✅ Required if postgres is used
			url: process.env.DEV_DATABASE_URL, // 🔐 Recommended: use env variable
		},
		redis: {
			enabled: true, // ✅ Required if Redis is used
			url: process.env.REDIS, // 🔐 Recommended: use env variable
		},
		kafka: {
			enabled: true, // ✅ Required if Kafka is used
			url: process.env.KAFKA_URL,
		},

		microservices: [
			{
				name: 'EntityManagementService', // ✅ Required: Unique name
				url: `${process.env.ENTITY_MANAGEMENT_SERVICE_BASE_URL}/health?serviceName=${process.env.SERVICE_NAME}`, // ✅ Required: Health check endpoint
				enabled: true, // ✅ Required: Set to true to activate
				request: {
					method: 'GET', // 🔄 HTTP method (GET or POST)
					header: {},
					body: {}, //🧾 Only needed for POST requests
				},

				expectedResponse: {
					status: 200, // HTTP status code to expect
					'params.status': 'successful', // ✅ Deep keys allowed
					'result.healthy': true, // ✅ Result if True
				},
			},
		],
	},
}
```
