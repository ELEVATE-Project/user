/**
 * name : app.js
 * author : Aman Kumar Gupta
 * Date : 29-Sep-2021
 * Description : Start file of a user service
 */
require('module-alias/register')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const expressFileUpload = require('express-fileupload')
const path = require('path')
const i18next = require('i18next')
const Backend = require('i18next-fs-backend')
const middleware = require('i18next-http-middleware')

require('dotenv').config({ path: './.env' })

const { elevateLog, correlationIdMiddleware } = require('elevate-logger')
elevateLog.config(process.env.ERROR_LOG_LEVEL, 'user', process.env.DISABLE_LOG)
const logger = elevateLog.init()
let environmentData = require('./envVariables')()

if (!environmentData.success) {
	logger.error('Server could not start . Not all environment variable is provided', {
		triggerNotification: true,
	})
	process.exit()
}

require('@configs')
const materializedViewsService = require('./generics/materializedViews')
require('@configs/cloud-service')

i18next
	.use(Backend)
	.use(middleware.LanguageDetector)
	.init({
		fallbackLng: 'en',
		lng: 'en',
		ns: ['translation'],
		defaultNS: 'translation',
		backend: {
			loadPath: './locales/{{lng}}.json',
		},
		detection: {
			lookupHeader: 'accept-language',
		},
	})

const app = express()

// Health check
require('@health-checks')(app)

app.use(cors())

app.use(middleware.handle(i18next))
app.use(correlationIdMiddleware)

app.use(expressFileUpload())
app.get(process.env.API_DOC_URL, function (req, res) {
	res.sendFile(path.join(__dirname, './api-doc/index.html'))
})
app.use(bodyParser.urlencoded({ extended: true, limit: '50MB' }))
app.use(bodyParser.json({ limit: '50MB' }))

app.use(express.static('public'))

// Middleware to set Access-Control-Allow-Origin header
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_HOST)
	next()
})

/* Logs request info if environment is configured to enable log */
app.all('*', (req, res, next) => {
	logger.info('***User Service Request Log***', {
		request: {
			requestType: `Request Type ${req.method} for ${req.url} on ${new Date()} from ${req.headers['user-agent']}`,
			requestHeaders: req.headers,
			requestBody: req.body,
			requestFiles: req.files,
		},
	})
	next()
})

async function buildViews() {
	console.log('Building Materialized views if not exits...')
	const startTime = Date.now()

	try {
		await materializedViewsService.checkAndCreateMaterializedViews()
		const endTime = Date.now()
		const elapsedTime = endTime - startTime
		console.log(`Completed building views. Time taken: ${elapsedTime} ms`)
	} catch (error) {
		console.error('Error while creating Materialized views:', error)
	}
}

buildViews()

/* Registered routes here */
require('./routes')(app)

// Server listens to given port
app.listen(process.env.APPLICATION_PORT, (res, err) => {
	if (err) {
		onError(err)
	}
	logger.info('Environment: ' + process.env.APPLICATION_ENV)
	logger.info('Application is running on the port:' + process.env.APPLICATION_PORT)
})

// Handles specific listen errors with friendly messages
function onError(error) {
	if (error.code === 'EACCES') {
		logger.error(process.env.APPLICATION_PORT + ' requires elevated privileges', {
			triggerNotification: true,
		})
		process.exit(1)
	} else if (error.code === 'EADDRINUSE') {
		logger.error(process.env.APPLICATION_PORT + ' is already in use', {
			triggerNotification: true,
		})
		process.exit(1)
	} else {
		throw error
	}
}
