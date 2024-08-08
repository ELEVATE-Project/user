let table = require('cli-table')

let tableData = new table()

let enviromentVariables = {
	APPLICATION_PORT: {
		message: 'Required port no',
		optional: false,
	},
	APPLICATION_HOST: {
		message: 'Required host',
		optional: false,
	},
	APPLICATION_ENV: {
		message: 'Required node environment',
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
	ACCESS_TOKEN_EXPIRY: {
		message: 'Required access token expiry',
		optional: false,
	},
	REFRESH_TOKEN_EXPIRY: {
		message: 'Required refresh token expiry',
		optional: false,
	},
	API_DOC_URL: {
		message: 'Required api doc url',
		optional: false,
	},
	INTERNAL_CACHE_EXP_TIME: {
		message: 'Internal Cache Expiry Time',
		optional: false,
	},
	REDIS_HOST: {
		message: 'Redis Host Url',
		optional: false,
	},
	KEY: {
		message: 'Key is missing for email encryption',
		optional: false,
	},
	IV: {
		message: 'iv is missing for email encryption',
		optional: false,
	},
	ERROR_LOG_LEVEL: {
		message: 'Required Error log level',
		optional: false,
	},
	DISABLE_LOG: {
		message: 'Required disable log level',
		optional: false,
	},
	ADMIN_SECRET_CODE: {
		message: 'Required Admin secret code',
		optional: false,
	},
	DEFAULT_ORGANISATION_CODE: {
		message: 'Required default organisation code',
		optional: false,
		default: 'sl',
	},
	MENTORING_SERVICE_URL: {
		message: 'Required Mentoring Service Url',
		optional: false,
	},
	ADMIN_INVITEE_UPLOAD_EMAIL_TEMPLATE_CODE: {
		message: 'Required admin upload invitee email template code',
		optional: false,
	},
	DEFAULT_QUEUE: {
		message: 'Required default queue',
		optional: false,
	},
	DEFAULT_ROLE: {
		message: 'Required default role',
		optional: false,
	},
	SAMPLE_CSV_FILE_PATH: {
		message: 'Required sample csv file path',
		optional: false,
		default: 'sample/bulk_user_creation.csv',
	},
	ORG_ADMIN_INVITATION_EMAIL_TEMPLATE_CODE: {
		message: 'Required org admin invitation email template code',
		optional: false,
	},
	DEFAULT_ORG_ID: {
		message: 'Default organization ID, Run seeder `insertDefaultOrg` to obtain it.',
		optional: false,
	},
	PORTAL_URL: {
		message: 'Required portal url',
		optional: false,
	},
	SCHEDULER_SERVICE_HOST: {
		message: 'Required scheduler service host',
		optional: false,
	},
	SCHEDULER_SERVICE_BASE_URL: {
		message: 'Required scheduler service base url',
		optional: false,
	},
	REFRESH_VIEW_INTERVAL: {
		message: 'Interval to refresh views in milliseconds',
		optional: false,
		default: 540000,
	},
	EMAIL_ID_ENCRYPTION_KEY: {
		message: 'Required Email ID Encryption Key',
		optional: false,
	},
	EMAIL_ID_ENCRYPTION_IV: {
		message: 'Required Email ID Encryption IV',
		optional: false,
	},
	EMAIL_ID_ENCRYPTION_ALGORITHM: {
		message: 'Required Email ID Encryption Algorithm',
		optional: false,
		default: 'aes-256-cbc',
	},
	EVENT_ORG_LISTENER_URLS: {
		message: 'Required List Of Org Event Listener Urls',
		optional: false,
	},
	EVENT_ENABLE_ORG_EVENTS: {
		message: 'Required Enable Org Events Flag',
		optional: false,
	},
	GENERIC_INVITATION_EMAIL_TEMPLATE_CODE: {
		message: 'Required generic invitation email template code',
		optional: true,
		default: 'generic_invite',
	},
	ALLOWED_HOST: {
		message: 'Required CORS allowed host',
		optional: true,
		default: '*',
	},
	PASSWORD_POLICY_REGEX: {
		message: 'Required password policy',
		optional: true,
		default: '^.{8,}$',
	},
	PASSWORD_POLICY_MESSAGE: {
		message: 'Required password policy message',
		optional: true,
		default: 'Password must have at least 8 characters long',
	},
	DOWNLOAD_URL_EXPIRATION_DURATION: {
		message: 'Required downloadable url expiration time',
		optional: true,
		default: 300,
	},
	ALLOWED_IDLE_TIME: {
		message: 'Require allowed idle time',
		optional: true,
		default: 0,
	},
	CHANGE_PASSWORD_TEMPLATE_CODE: {
		message: 'Required change password email template code',
		optional: false,
	},
	CAPTCHA_ENABLE: {
		message: 'Required CAPTCHA ENABLE true or false',
		optional: false,
	},
	CAPTCHA_SERVICE: {
		message: 'Required CAPTCHA SERVICE',
		optional: true,
		default: 'googleRecaptcha',
	},
	RECAPTCHA_SECRET_KEY: {
		message: 'Required CAPTCHA SERVICE secret key',
		optional: false,
	},
	GOOGLE_RECAPTCHA_HOST: {
		message: 'Required CAPTCHA Host IP',
		optional: true,
		default: 'https://www.google.com',
	},
	GOOGLE_RECAPTCHA_URL: {
		message: 'Required CAPTCHA SERVICE API URL',
		optional: true,
		default: '/recaptcha/api/siteverify',
	},
	SIGNED_URL_EXPIRY_DURATION: {
		message: 'Required signed url expiration time in seconds',
		optional: true,
		default: 900,
	},
	ALLOWED_ACTIVE_SESSIONS: {
		message: 'Require allowed active sessions',
		optional: true,
		default: 0,
	},
	CLOUD_STORAGE_PROVIDER: {
		message: 'Require cloud storage provider, in azure,aws, gcloud,oci and s3',
		optional: false,
	},
	CLOUD_STORAGE_SECRET: {
		message: 'Require client storage provider identity',
		optional: false,
	},
	CLOUD_STORAGE_BUCKETNAME: {
		message: 'Require client storage bucket name',
		optional: false,
	},
	CLOUD_STORAGE_BUCKET_TYPE: {
		message: 'Require storage bucket type',
		optional: false,
	},
	PUBLIC_ASSET_BUCKETNAME: {
		message: 'Require asset storage bucket name',
		optional: false,
	},
	CLOUD_STORAGE_REGION: {
		message: 'Require storage region',
		optional: true,
	},
	CLOUD_ENDPOINT: {
		message: 'Require asset storage endpoint',
		optional: true,
	},
	CLOUD_STORAGE_ACCOUNTNAME: {
		message: 'Require account name',
		optional: false,
	},
	APPLICATION_BASE_URL: {
		message: 'Require Base URL',
		optional: false,
		default: '/user',
	},
	SCHEDULER_PERIODIC_JOB_NAME_USER_MVIEWS: {
		message: 'Require Scheduler service periodic job name',
		optional: true,
		default: 'project_users_repeatable_view_job',
	},
	SCHEDULER_JOB_NAME_USER_MVIEWS: {
		message: 'Require Scheduler service job name',
		optional: true,
		default: 'BuildMaterializedViewsprojectUsers',
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
