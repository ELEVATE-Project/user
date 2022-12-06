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
const kafkaCommunication = require('@generics/kafka-communication')
let environmentData = require('./envVariables')()

if (!environmentData.success) {
	console.log('Server could not start . Not all environment variable is provided')
	process.exit()
}

require('@configs')

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

const { requestLoggingMiddleware } = require(`./log/request-logging-middleware`)
const { correlationIdMiddleware } = require(`./log/correlation-id-middleware`)
const { logger } = require('./log/logger')
// const logger = kafkaCommunication.pushkafka
app.use(correlationIdMiddleware)
// app.use(requestLoggingMiddleware)

// var graylog2 = require('graylog2')
// var logger = new graylog2.graylog({
// 	servers: [
// 		{ host: '127.0.0.1', port: 12201 },
// 		{ host: '127.0.0.2', port: 12201 },
// 	],
// 	hostname: 'users', // the name of this host
// 	// (optional, default: os.hostname())
// 	facility: 'Node.js', // the facility for these log messages
// 	// (optional, default: "Node.js")
// 	bufferSize: 1350, // max UDP packet size, should never exceed the
// 	// MTU of your system (optional, default: 1400)
// })

// logger.on('error', function (error) {
// 	console.error('Error while trying to write to graylog2:', error)
// })
// Health check
require('@health-checks')(app)

app.use(cors())

app.use(middleware.handle(i18next))

app.use(expressFileUpload())
app.get(process.env.API_DOC_URL, function (req, res) {
	res.sendFile(path.join(__dirname, './api-doc/index.html'))
})
app.use(bodyParser.urlencoded({ extended: true, limit: '50MB' }))
app.use(bodyParser.json({ limit: '50MB' }))

app.use(express.static('public'))

/* Logs request info if environment is configured to enable log */
if (process.env.ENABLE_LOG === 'true') {
	app.all('*', (req, res, next) => {
		logger.info('User Service Logs Starts Here')
		logger.info(`Request Type ${req.method} for ${req.url} on ${new Date()} from `)
		logger.info(req.headers)
		logger.info(`Request Body: ${req.body}`)
		console.log(`Request Type ${req.method} for ${req.url} on ${new Date()} from `)
		console.log(req.headers)
		console.log('Request Body:', req.body)
		// logger(`Request Body: ${req.body}`)
		// logger('Request Files: ')
		console.error('***User Service Logs Ends Here***', 'ankitshahu')
		next()
	})
}

/* Registered routes here */
require('./routes')(app)

// Server listens to given port
app.listen(process.env.APPLICATION_PORT, (res, err) => {
	if (err) {
		onError(err)
	}
	// logger.info('Environment: ' + process.env.APPLICATION_ENV)
	// logger.info('Application is running on the port:' + process.env.APPLICATION_PORT)
})

// Handles specific listen errors with friendly messages
function onError(error) {
	switch (error.code) {
		case 'EACCES':
			console.log(process.env.APPLICATION_PORT + ' requires elevated privileges')
			process.exit(1)
		case 'EADDRINUSE':
			console.log(process.env.APPLICATION_PORT + ' is already in use')
			process.exit(1)
		default:
			throw error
	}
}
