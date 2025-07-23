/**
 * name : helpers/responses.js
 * author : vishnu
 * Date : 30-Jan-2024
 * Description : Response constants used in this service
 */

const form = require('@generics/form')
const { elevateLog, correlationId } = require('elevate-logger')
const logger = elevateLog.init()
const successResponse = async ({ statusCode = 500, responseCode = 'OK', message, result = [], meta = {} }) => {
	const versions = await form.getAllFormsVersion()
	let response = {
		statusCode,
		responseCode,
		message,
		result,
		meta: { ...meta, formsVersion: versions, correlation: correlationId.getId() },
	}
	logger.info('Request Response', { response: response })

	return response
}

const failureResponse = ({ message = 'Oops! Something Went Wrong.', statusCode = 500, responseCode, result }) => {
	const errorMessage = message.key || message

	const error = new Error(errorMessage)
	error.statusCode = statusCode
	error.responseCode = responseCode
	error.interpolation = message?.interpolation || false
	error.data = result || []

	return error
}

module.exports = {
	successResponse,
	failureResponse,
}
