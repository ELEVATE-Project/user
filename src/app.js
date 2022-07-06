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
		console.log('***User Service Logs Starts Here***')
		console.log('Request Type %s for %s on %s from ', req.method, req.url, new Date())
		console.log('Request Headers: ', req.headers)
		console.log('Request Body: ', req.body)
		console.log('Request Files: ', req.files)
		console.log('***User Service Logs Ends Here***')
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
	console.log('Environment: ' + process.env.APPLICATION_ENV)
	console.log('Application is running on the port:' + process.env.APPLICATION_PORT)
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
