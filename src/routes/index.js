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
const { elevateLog, correlationId } = require('elevate-logger')
const logger = elevateLog.init()

module.exports = (app) => {
	app.use(authenticator)
	app.use(pagination)
	app.use(expressValidator())

	async function router(req, res, next) {
		let controllerResponse
		let validationError

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
				controller = require(`@controllers/${req.params.version}/${req.params.controller}/${req.params.file}`)
			} else {
				controller = require(`@controllers/${req.params.version}/${req.params.controller}`)
			}
			controllerResponse = new controller()[req.params.method]
				? await new controller()[req.params.method](req)
				: next()
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

	app.all(process.env.APPLICATION_BASE_URL + ':version/:controller/:method', validator, router)
	app.all(process.env.APPLICATION_BASE_URL + ':version/:controller/:method/:id', validator, router)
	app.all(process.env.APPLICATION_BASE_URL + ':version/:controller/:file/:method', validator, router)
	app.all(process.env.APPLICATION_BASE_URL + ':version/:controller/:file/:method/:id', validator, router)

	app.use((req, res, next) => {
		res.status(404).json({
			responseCode: 'RESOURCE_ERROR',
			message: 'Requested resource not found!',
		})
	})

	// Global error handling middleware, should be present in last in the stack of a middleware's
	app.use((error, req, res, next) => {
		const status = error.statusCode || 500
		const responseCode = error.responseCode || 'SERVER_ERROR'
		const message = error.message || ''
		let errorData = []

		if (error.data) {
			errorData = error.data
		}
		if (status == 500) {
			logger.error('Server error!', { message: error.stack, triggerNotification: true })
		} else {
			logger.info(message, { message: error })
		}
		const options = {
			responseCode,
			error: errorData,
			meta: { correlation: correlationId.getId() },
		}
		let interpolationOptions = {
			...error?.interpolation,
			interpolation: { escapeValue: false },
		}
		error.interpolation
			? (options.message = req.t(message, interpolationOptions))
			: (options.message = req.t(message))

		res.status(status).json(options)
	})
}
