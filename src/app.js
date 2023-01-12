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
const path = require('path')
require('dotenv').config({ path: './.env' })
require('@configs')

const { elevateLog, correlationIdMiddleware } = require('elevate-logger')
elevateLog.config(process.env.ERROR_LOG_LEVEL, 'notification', process.env.DISABLE_LOG)
const logger = elevateLog.init()

let environmentData = require('./envVariables')()

if (!environmentData.success) {
	logger.error('Server could not start . Not all environment variable is provided', {
		triggerNotification: true,
	})
	process.exit()
}

const app = express()

// Health check
require('@health-checks')(app)

app.use(cors())
app.use(correlationIdMiddleware)

app.use(bodyParser.urlencoded({ extended: true, limit: '50MB' }))
app.use(bodyParser.json({ limit: '50MB' }))

app.use(express.static('public'))

app.get(process.env.API_DOC_URL, function (req, res) {
	res.sendFile(path.join(__dirname, './api-doc/index.html'))
})

/* Logs request info if environment is not development*/
app.all('*', (req, res, next) => {
	logger.info('***Notification Service Request Log***', {
		request: {
			requestType: `Request Type ${req.method} for ${req.url} on ${new Date()} from `,
			requestHeaders: req.headers,
			requestBody: req.body,
			requestFiles: req.files,
		},
	})
	next()
})

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
	switch (error.code) {
		case 'EACCES':
			logger.error(process.env.APPLICATION_PORT + ' requires elevated privileges', {
				triggerNotification: true,
			})
			process.exit(1)
		case 'EADDRINUSE':
			logger.error(process.env.APPLICATION_PORT + ' is already in use', {
				triggerNotification: true,
			})
			process.exit(1)
		default:
			throw error
	}
}
