/**
 * name : routes
 * author : Aman Kumar Gupta
 * Date : 30-Sep-2021
 * Description : Routes for available service
 */

const validator = require('@middlewares/validator')
const authenticator = require('@middlewares/authenticator')
const pagination = require('@middlewares/pagination')
const expressValidator = require('express-validator')
const fs = require('fs')
const { elevateLog, correlationId } = require('elevate-logger')
const logger = elevateLog.init()
const path = require('path')

module.exports = (app) => {
	app.use(authenticator)
	app.use(pagination)
	app.use(expressValidator())
	async function getAllowedControllers(directoryPath) {
		try {
			const getAllFilesAndDirectories = (dir) => {
				let filesAndDirectories = []
				fs.readdirSync(dir).forEach((item) => {
					const itemPath = path.join(dir, item)
					const stat = fs.statSync(itemPath)
					if (stat.isDirectory()) {
						filesAndDirectories.push({
							name: item,
							type: 'directory',
							path: itemPath,
						})
						filesAndDirectories = filesAndDirectories.concat(getAllFilesAndDirectories(itemPath))
					} else {
						filesAndDirectories.push({
							name: item,
							type: 'file',
							path: itemPath,
						})
					}
				})
				return filesAndDirectories
			}

			const allFilesAndDirectories = getAllFilesAndDirectories(directoryPath)
			const allowedControllers = allFilesAndDirectories
				.filter((item) => item.type === 'file' && item.name.endsWith('.js'))
				.map((item) => path.basename(item.name, '.js')) // Remove the ".js" extension

			const allowedVersions = allFilesAndDirectories
				.filter((item) => item.type === 'directory')
				.map((item) => item.name)

			return {
				allowedControllers,
				allowedVersions,
			}
		} catch (err) {
			console.error('Unable to scan directory:', err)
			return {
				allowedControllers: [],
				directories: [],
			}
		}
	}
	async function router(req, res, next) {
		let controllerResponse
		let validationError
		const version = (req.params.version.match(/^v\d+$/) || [])[0] // Match version like v1, v2, etc.
		const controllerName = (req.params.controller.match(/^[a-zA-Z0-9_-]+$/) || [])[0] // Allow only alphanumeric characters, underscore, and hyphen
		const file = req.params.file ? (req.params.file.match(/^[a-zA-Z0-9_-]+$/) || [])[0] : null // Same validation as controller, or null if file is not provided
		const method = (req.params.method.match(/^[a-zA-Z0-9]+$/) || [])[0] // Allow only alphanumeric characters
		try {
			if (!version || !controllerName || !method || (req.params.file && !file)) {
				// Invalid input, return an error response
				const error = new Error('Invalid Path')
				error.statusCode = 400
				throw error
			}

			const directoryPath = path.resolve(__dirname, '..', 'controllers')

			const { allowedControllers, allowedVersions } = await getAllowedControllers(directoryPath)

			// Validate version
			if (!allowedVersions.includes(version)) {
				const error = new Error('Invalid version.')
				error.statusCode = 400
				throw error
			}

			// Validate controller
			allowedControllers.push('cloud-services')
			if (!allowedControllers.includes(controllerName)) {
				const error = new Error('Invalid controller.')
				error.statusCode = 400
				throw error
			}
		} catch (error) {
			return next(error)
		}

		/* Check for input validation error */
		try {
			validationError = req.validationErrors()
		} catch (error) {
			error.statusCode = 422
			error.responseCode = 'CLIENT_ERROR'
			return next(error)
		}

		if (validationError.length) {
			const error = new Error('Validation failed, Entered data is incorrect!')
			error.statusCode = 422
			error.responseCode = 'CLIENT_ERROR'
			error.data = validationError
			return next(error)
		}

		try {
			let controller
			if (req.params.file) {
				let folderExists = fs.existsSync(
					PROJECT_ROOT_DIRECTORY +
						'/controllers/' +
						req.params.version +
						'/' +
						req.params.controller +
						'/' +
						req.params.file +
						'.js'
				)
				if (folderExists) {
					controller = require(`@controllers/${version}/${controllerName}/${file}`)
				} else {
					controller = require(`@controllers/${version}/${controllerName}`)
				}
			} else {
				controller = require(`@controllers/${version}/${controllerName}`)
			}
			controllerResponse = new controller()[method] ? await new controller()[method](req) : next()
		} catch (error) {
			// If controller or service throws some random error
			return next(error)
		}

		if (
			controllerResponse &&
			controllerResponse.statusCode !== 200 &&
			controllerResponse.statusCode !== 201 &&
			controllerResponse.statusCode !== 202
		) {
			/* If error obtained then global error handler gets executed */
			return next(controllerResponse)
		}
		if (controllerResponse) {
			res.status(controllerResponse.statusCode).json({
				responseCode: controllerResponse.responseCode,
				message: req.t(controllerResponse.message),
				result: controllerResponse.result,
				meta: controllerResponse.meta,
			})
		}
	}

	app.all(process.env.APPLICATION_BASE_URL + '/:version/:controller/:method', validator, router)
	app.all(process.env.APPLICATION_BASE_URL + '/:version/:controller/:file/:method', validator, router)
	app.all(process.env.APPLICATION_BASE_URL + '/:version/:controller/:method/:id', validator, router)
	app.all(process.env.APPLICATION_BASE_URL + '/:version/:controller/:file/:method/:id', validator, router)

	app.use((req, res, next) => {
		res.status(404).json({
			responseCode: 'RESOURCE_ERROR',
			message: 'Requested resource not found!',
		})
	})

	// Global error handling middleware, should be present in last in the stack of a middleware's
	app.use((error, req, res, next) => {
		if (error.statusCode || error.responseCode) {
			// Detailed error response
			const status = error.statusCode || 500
			const responseCode = error.responseCode || 'SERVER_ERROR'
			const message = error.message || 'Oops! Something Went Wrong.'
			const errorData = error.data || []

			logger.info(message, { message: error })

			const options = {
				responseCode,
				error: errorData,
				meta: { correlation: correlationId.getId() },
			}

			const interpolationOptions = {
				...error?.interpolation,
				interpolation: { escapeValue: false },
			}

			options.message = error.interpolation ? req.t(message, interpolationOptions) : req.t(message)

			res.status(status).json(options)
		} else {
			// Limited info response
			const errorMessage = 'Oops! Something Went Wrong.'

			logger.error('Server error!', { message: error.stack, triggerNotification: true })
			console.error('Error occurred on the server:')
			console.error(error)

			res.status(500).json({
				responseCode: 'SERVER_ERROR',
				message: errorMessage,
				meta: { correlation: correlationId.getId() },
			})
		}
	})
}
