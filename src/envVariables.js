let table = require('cli-table')

let tableData = new table()

let enviromentVariables = {
	APPLICATION_PORT: {
		message: 'Required port no',
		optional: false,
	},
	APPLICATION_ENV: {
		message: 'Required node environment',
		optional: false,
	},
	MONGODB_URL: {
		message: 'Required mongodb url',
		optional: false,
	},
	SALT_ROUNDS: {
		message: 'Required salt rounds for encryption',
		optional: false,
	},
	ACCESS_TOKEN_SECRET: {
		message: 'Required access token secret',
		optional: false,
	},
	REFRESH_TOKEN_SECRET: {
		message: 'Required refresh token secret',
		optional: false,
	},
	APP_NAME: {
		message: 'Application Name',
		optional: false,
	},
	REGISTRATION_EMAIL_TEMPLATE_CODE: {
		message: 'Required registration email template code',
		optional: false,
	},
	OTP_EMAIL_TEMPLATE_CODE: {
		message: 'Required otp email template code',
		optional: false,
	},
	KAFKA_URL: {
		message: 'Required kafka connectivity url',
		optional: false,
	},
	KAFKA_GROUP_ID: {
		message: 'Required kafka group id',
		optional: false,
	},
	KAFKA_TOPIC: {
		message: 'Required kafka topic to consume from',
		optional: true,
	},
	NOTIFICATION_KAFKA_TOPIC: {
		message: 'Required kafka topic',
		optional: false,
	},
	CLOUD_STORAGE: {
		message: 'Required cloud storage type ex: AWS/GCP/AZURE',
		optional: false,
	},
	GCP_PATH: {
		message: 'Required gcp file path ex: gcp.json',
		optional: process.env.CLOUD_STORAGE === 'GCP' ? false : true,
	},
	DEFAULT_GCP_BUCKET_NAME: {
		message: 'Required gcp bucket name',
		optional: process.env.CLOUD_STORAGE === 'GCP' ? false : true,
	},
	GCP_PROJECT_ID: {
		message: 'Required gcp project id',
		optional: process.env.CLOUD_STORAGE === 'GCP' ? false : true,
	},
	AWS_ACCESS_KEY_ID: {
		message: 'Required aws access key id',
		optional: process.env.CLOUD_STORAGE === 'AWS' ? false : true,
	},
	AWS_SECRET_ACCESS_KEY: {
		message: 'Required aws secret access key',
		optional: process.env.CLOUD_STORAGE === 'AWS' ? false : true,
	},
	AWS_BUCKET_REGION: {
		message: 'Required aws bucket region',
		optional: process.env.CLOUD_STORAGE === 'AWS' ? false : true,
	},
	AWS_BUCKET_ENDPOINT: {
		message: 'Required aws bucket endpoint',
		optional: process.env.CLOUD_STORAGE === 'AWS' ? false : true,
	},
	DEFAULT_AWS_BUCKET_NAME: {
		message: 'Required aws bucket name',
		optional: process.env.CLOUD_STORAGE === 'AWS' ? false : true,
	},
	AZURE_ACCOUNT_NAME: {
		message: 'Required azure account name',
		optional: process.env.CLOUD_STORAGE === 'AZURE' ? false : true,
	},
	AZURE_ACCOUNT_KEY: {
		message: 'Required azure account key',
		optional: process.env.CLOUD_STORAGE === 'AZURE' ? false : true,
	},
	DEFAULT_AZURE_CONTAINER_NAME: {
		message: 'Required azure container name',
		optional: process.env.CLOUD_STORAGE === 'AZURE' ? false : true,
	},
	MENTOR_SECRET_CODE: {
		message: 'Required mentor secret code',
		optional: false,
	},
	ACCESS_TOKEN_EXPIRY: {
		message: 'Required access token expiry in days',
		optional: false,
	},
	REFRESH_TOKEN_EXPIRY: {
		message: 'Required refresh token expiry in days',
		optional: false,
	},
	API_DOC_URL: {
		message: 'Required api doc url',
		optional: false,
	},
	ENABLE_EMAIL_FOR_REPORTED_ISSUE: {
		message: 'Required true or false',
		optional: false,
	},
	SUPPORT_EMAIL_ID: {
		message: 'Required email id of support',
		optional: process.env.ENABLE_EMAIL_FOR_REPORTED_ISSUE === 'true' ? false : true,
	},
	REPORTED_ISSUE_EMAIL_TEMPLATE_CODE: {
		message: 'Required reported issue email template code',
		optional: process.env.ENABLE_EMAIL_FOR_REPORTED_ISSUE === 'true' ? false : true,
	INTERNAL_CACHE_EXP_TIME: {
		message: 'Internal Cache Expiry Time',
		optional: false,
	},
	REDIS_CACHE_EXP_TIME: {
		message: 'Redis Cache Expiry Time',
		optional: false,
	},
	RATING_KAFKA_TOPIC: {
		message: 'Kafka Rating Topic',
		optional: false,
	},
	REDIS_HOST: {
		message: 'Redis Host Url',
		optional: false,
	},
}

let success = true

module.exports = function () {
	Object.keys(enviromentVariables).forEach((eachEnvironmentVariable) => {
		let tableObj = {
			[eachEnvironmentVariable]: 'PASSED',
		}

		let keyCheckPass = true

		if (
			enviromentVariables[eachEnvironmentVariable].optional === true &&
			enviromentVariables[eachEnvironmentVariable].requiredIf &&
			enviromentVariables[eachEnvironmentVariable].requiredIf.key &&
			enviromentVariables[eachEnvironmentVariable].requiredIf.key != '' &&
			enviromentVariables[eachEnvironmentVariable].requiredIf.operator &&
			validRequiredIfOperators.includes(enviromentVariables[eachEnvironmentVariable].requiredIf.operator) &&
			enviromentVariables[eachEnvironmentVariable].requiredIf.value &&
			enviromentVariables[eachEnvironmentVariable].requiredIf.value != ''
		) {
			switch (enviromentVariables[eachEnvironmentVariable].requiredIf.operator) {
				case 'EQUALS':
					if (
						process.env[enviromentVariables[eachEnvironmentVariable].requiredIf.key] ===
						enviromentVariables[eachEnvironmentVariable].requiredIf.value
					) {
						enviromentVariables[eachEnvironmentVariable].optional = false
					}
					break
				case 'NOT_EQUALS':
					if (
						process.env[enviromentVariables[eachEnvironmentVariable].requiredIf.key] !=
						enviromentVariables[eachEnvironmentVariable].requiredIf.value
					) {
						enviromentVariables[eachEnvironmentVariable].optional = false
					}
					break
				default:
					break
			}
		}

		if (enviromentVariables[eachEnvironmentVariable].optional === false) {
			if (!process.env[eachEnvironmentVariable] || process.env[eachEnvironmentVariable] == '') {
				success = false
				keyCheckPass = false
			} else if (
				enviromentVariables[eachEnvironmentVariable].possibleValues &&
				Array.isArray(enviromentVariables[eachEnvironmentVariable].possibleValues) &&
				enviromentVariables[eachEnvironmentVariable].possibleValues.length > 0
			) {
				if (
					!enviromentVariables[eachEnvironmentVariable].possibleValues.includes(
						process.env[eachEnvironmentVariable]
					)
				) {
					success = false
					keyCheckPass = false
					enviromentVariables[eachEnvironmentVariable].message += ` Valid values - ${enviromentVariables[
						eachEnvironmentVariable
					].possibleValues.join(', ')}`
				}
			}
		}

		if (
			(!process.env[eachEnvironmentVariable] || process.env[eachEnvironmentVariable] == '') &&
			enviromentVariables[eachEnvironmentVariable].default &&
			enviromentVariables[eachEnvironmentVariable].default != ''
		) {
			process.env[eachEnvironmentVariable] = enviromentVariables[eachEnvironmentVariable].default
		}

		if (!keyCheckPass) {
			if (enviromentVariables[eachEnvironmentVariable].message !== '') {
				tableObj[eachEnvironmentVariable] = enviromentVariables[eachEnvironmentVariable].message
			} else {
				tableObj[eachEnvironmentVariable] = `FAILED - ${eachEnvironmentVariable} is required`
			}
		}

		tableData.push(tableObj)
	})

	console.log(tableData.toString())

	return {
		success: success,
	}
}
