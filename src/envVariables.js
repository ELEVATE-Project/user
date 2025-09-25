let table = require('cli-table')

let tableData = new table()

let enviromentVariables = {
	APPLICATION_PORT: {
		message: 'Required port no',
		optional: true,
		default: '3001',
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
		optional: true,
		default: 'MentorED',
	},
	REGISTRATION_EMAIL_TEMPLATE_CODE: {
		message: 'Required registration email template code',
		optional: true,
		default: 'registration',
	},
	REGISTRATION_OTP_EMAIL_TEMPLATE_CODE: {
		message: 'Required registration otp email template code',
		optional: true,
		default: 'registrationotp',
	},
	KAFKA_URL: {
		message: 'Required kafka connectivity url',
		optional: false,
	},
	KAFKA_GROUP_ID: {
		message: 'Required kafka group id',
		optional: true,
		default: 'user',
	},
	KAFKA_TOPIC: {
		message: 'Required kafka topic to consume from',
		optional: true,
		default: 'mentoring.topic',
	},
	NOTIFICATION_KAFKA_TOPIC: {
		message: 'Required kafka topic',
		optional: true,
		default: 'notificationtopic',
	},
	ACCESS_TOKEN_EXPIRY: {
		message: 'Required access token expiry',
		optional: true,
		default: '1440m',
	},
	REFRESH_TOKEN_EXPIRY: {
		message: 'Required refresh token expiry',
		optional: true,
		default: 7,
	},
	API_DOC_URL: {
		message: 'Required api doc url',
		optional: true,
		default: '/user/api-doc',
	},
	INTERNAL_CACHE_EXP_TIME: {
		message: 'Internal Cache Expiry Time',
		optional: true,
		default: 86400,
	},
	REDIS_HOST: {
		message: 'Redis Host Url',
		optional: false,
	},
	ERROR_LOG_LEVEL: {
		message: 'Required Error log level',
		optional: true,
		default: 'silly',
	},
	DISABLE_LOG: {
		message: 'Required disable log level',
		optional: true,
		default: true,
	},
	ADMIN_SECRET_CODE: {
		message: 'Required Admin secret code',
		optional: false,
	},
	DEFAULT_ORGANISATION_CODE: {
		message: 'Required default organisation code',
		optional: true,
		default: 'default',
	},
	MENTORING_SERVICE_URL: {
		message: 'Required Mentoring Service Url',
		optional: false,
	},
	ADMIN_INVITEE_UPLOAD_EMAIL_TEMPLATE_CODE: {
		message: 'Required admin upload invitee email template code',
		optional: true,
		default: 'invitee_upload_status',
	},
	ADMIN_INVITEE_UPLOAD_ERROR_EMAIL_TEMPLATE_CODE: {
		message: 'Required admin upload invitee error email template code',
		optional: true,
		default: 'invitee_upload_error',
	},
	DEFAULT_QUEUE: {
		message: 'Required default queue',
		optional: true,
		default: 'defaultUser-queue',
	},
	DEFAULT_ROLE: {
		message: 'Required default role',
		optional: true,
		default: 'mentee',
	},
	SAMPLE_CSV_FILE_PATH: {
		message: 'Required sample csv file path',
		optional: true,
		default: 'sample/bulk_user_creation.csv',
	},
	ORG_ADMIN_INVITATION_EMAIL_TEMPLATE_CODE: {
		message: 'Required org admin invitation email template code',
		optional: true,
		default: 'invite_org_admin',
	},
	DEFAULT_ORG_ID: {
		message: 'Default organization ID, Run seeder `insertDefaultOrg` to obtain it.',
		optional: true,
		default: 1,
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
		optional: true,
		default: '/scheduler/',
	},
	REFRESH_VIEW_INTERVAL: {
		message: 'Interval to refresh views in milliseconds',
		optional: true,
		default: 30000,
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
		optional: true,
		default: 'aes-256-cbc',
	},
	ENABLE_EMAIL_OTP_VERIFICATION: {
		message: 'Required Email otp verification ',
		optional: true,
		default: 'true',
	},
	ENABLE_LOG: {
		message: 'Required ENABLE LOG ',
		optional: true,
		default: 'true',
	},
	EVENT_ORG_LISTENER_URLS: {
		message: 'Required List Of Org Event Listener Urls',
		optional: false,
	},
	EVENT_ENABLE_ORG_EVENTS: {
		message: 'Required Enable Org Events Flag',
		optional: true,
		default: 'true',
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
		default: '^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[~!@#$%^&*()_+`\\-={}"\';<>?,./\\\\]).{8,}$',
	},
	PASSWORD_POLICY_MESSAGE: {
		message: 'Required password policy message',
		optional: true,
		default:
			'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character',
	},
	DOWNLOAD_URL_EXPIRATION_DURATION: {
		message: 'Required downloadable url expiration time',
		optional: true,
		default: 300000,
	},
	ALLOWED_IDLE_TIME: {
		message: 'Require allowed idle time',
		optional: true,
		default: 3600,
	},
	CHANGE_PASSWORD_TEMPLATE_CODE: {
		message: 'Required change password email template code',
		optional: true,
		default: 'change_password',
	},
	BULK_CREATE_TEMPLATE_CODE: {
		message: 'Required bulk create email template code',
		optional: true,
		default: 'bulk_user_create',
	},
	CAPTCHA_ENABLE: {
		message: 'Required CAPTCHA ENABLE true or false',
		optional: false,
	},
	CAPTCHA_SERVICE: {
		message: 'Required CAPTCHA SERVICE',
		optional: process.env.CAPTCHA_ENABLE === 'false' ? true : false,
		default: 'googleRecaptcha',
	},
	CLEAR_INTERNAL_CACHE: {
		message: 'Required CLEAR INTERNAL CACHE ',
		optional: true,
		default: 'userinternal',
	},
	RECAPTCHA_SECRET_KEY: {
		message: 'Required CAPTCHA SERVICE secret key',
		optional: process.env.CAPTCHA_ENABLE === 'false' ? true : false,
	},
	GOOGLE_RECAPTCHA_HOST: {
		message: 'Required CAPTCHA Host IP',
		optional: process.env.CAPTCHA_ENABLE === 'false' ? true : false,
		default: 'https://www.google.com',
	},
	GOOGLE_RECAPTCHA_URL: {
		message: 'Required CAPTCHA SERVICE API URL',
		optional: process.env.CAPTCHA_ENABLE === 'false' ? true : false,
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
		optional: true,
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
	MENTEE_INVITATION_EMAIL_TEMPLATE_CODE: {
		message: 'Require email code for mentee invitation',
		optional: true,
		default: 'invite_mentee',
	},
	MENTOR_INVITATION_EMAIL_TEMPLATE_CODE: {
		message: 'Require email code for mentor invitation',
		optional: true,
		default: 'invite_mentor',
	},
	MENTOR_REQUEST_ACCEPTED_EMAIL_TEMPLATE_CODE: {
		message: 'Require email code for mentor request accepted',
		optional: true,
		default: 'mentor_request_accepted',
	},
	MENTOR_REQUEST_REJECTED_EMAIL_TEMPLATE_CODE: {
		message: 'Require email code for mentor request rejected',
		optional: true,
		default: 'mentor_request_rejected',
	},
	OTP_EMAIL_TEMPLATE_CODE: {
		message: 'Require email code for otp',
		optional: true,
		default: 'emailotp',
	},
	OTP_EXP_TIME: {
		message: 'Require otp expire time in seconds',
		optional: true,
		default: 300,
	},
	RATING_KAFKA_TOPIC: {
		message: 'Require kafka topic for rating',
		optional: true,
		default: 'mentoring.rating',
	},
	SIGNED_URL_EXPIRY_IN_MILLISECONDS: {
		message: 'Require signed url expiry in milliseconds',
		optional: true,
		default: 120000,
	},
	DEFAULT_TENANT_CODE: {
		message: 'Require default tenant code',
		optional: true,
		default: 'default',
	},
	ENTITY_MANAGEMENT_SERVICE_BASE_URL: {
		message: 'Require entity management base url',
		optional: false,
	},
	IS_AUTH_TOKEN_BEARER: {
		message: 'Required specification: If auth token is bearer or not',
		optional: true,
		default: true,
	},
	NOTIFICATION_MODE: {
		message: 'If its kafka or API',
		optional: true,
		default: 'kafka',
	},
	NOTIFICATION_API_URL: {
		message: 'URL for notification service',
		optional: process.env.NOTIFICATION_MODE === 'API' ? false : true,
	},
	EVENT_ENABLE_USER_EVENTS: {
		message: 'Key to toggle user creation API event',
		optional: true,
	},
	EVENT_USER_LISTENER_API: {
		message: 'URL for User creation Event',
		optional: true,
		requiredIf: {
			key: 'EVENT_ENABLE_USER_EVENTS',
			operator: 'EQUALS',
			value: 'true',
		},
	},
	EVENT_ENABLE_KAFKA_PUSH: {
		message: 'Key to toggle user creation kafka event',
		optional: true,
	},
	ENABLE_USER_KAFKA_EVENTS: {
		message: 'Key to toggle user creation kafka event',
		optional: true,
	},
	EVENT_USER_KAFKA_TOPIC: {
		message: 'Kafka topic for User creation Event',
		optional: true,
		requiredIf: {
			key: 'ENABLE_USER_KAFKA_PUSH',
			operator: 'EQUALS',
			value: 'true',
		},
	},
	DEFAULT_PHONE_CODE: {
		message: 'Set Default Phone Code',
		optional: true,
		default: '+91',
	},
	KAFKA_HEALTH_CHECK_TOPIC: {
		message: 'Required KAFKA_HEALTH_CHECK_TOPIC',
		optional: true,
		default: 'user-health-check-topic-check',
	},
	EVENT_ENABLE_TENANT_EVENTS: {
		message: 'Key to toggle tenant creation api event',
		optional: true,
	},
	ENABLE_TENANT_KAFKA_EVENTS: {
		message: 'Key to toggle tenant creation kafka event',
		optional: true,
	},
	EVENT_TENANT_KAFKA_TOPIC: {
		message: 'Kafka topic for Tenant creation Event',
		optional: true,
		requiredIf: {
			key: 'ENABLE_TENANT_KAFKA_EVENTS',
			operator: 'EQUALS',
			value: 'true',
		},
	},
	EVENT_TENANT_LISTENER_API: {
		message: 'URL for Tenant creation Event',
		optional: true,
		requiredIf: {
			key: 'EVENT_ENABLE_TENANT_EVENTS',
			operator: 'EQUALS',
			value: 'true',
		},
	},
	ENABLE_ORG_KAFKA_EVENTS: {
		message: 'Key to toggle organization creation kafka event',
		optional: true,
	},
	EVENT_ORGANIZATION_KAFKA_TOPIC: {
		message: 'Kafka topic for organization create/update Event',
		optional: true,
		requiredIf: {
			key: 'ENABLE_ORG_KAFKA_EVENTS',
			operator: 'EQUALS',
			value: 'true',
		},
	},
}
let success = true

module.exports = function () {
	Object.keys(enviromentVariables).forEach((eachEnvironmentVariable) => {
		let tableObj = {
			[eachEnvironmentVariable]: 'PASSED',
		}

		let keyCheckPass = true
		let validRequiredIfOperators = ['EQUALS', 'NOT_EQUALS']

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
