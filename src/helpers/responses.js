/**
 * name : helpers/responses.js
 * author : Vishnu
 * Date : 31-Jan-2024
 * Description : API response used in the service
 */

const { elevateLog, correlationId } = require('elevate-logger')
const logger = elevateLog.init()

/**
 * Success response
 * @method
 * @name successResponse
 * @param  {String} statusCode status code of the response.
 * @param  {String} responseCode response code.
 * @param  {String} message response message.
 * @param {String} result - result
 * @returns {JSON} Returns response format
 */
const successResponse = ({ statusCode = 200, responseCode = 'OK', message, result = [], meta = {} }) => {
	let response = {
		statusCode,
		responseCode,
		message,
		result,
		meta: { ...meta, correlation: correlationId.getId() },
	}

	logger.info('Request Response', { response: response })

	return response
}

/**
 * failure response
 * @method
 * @name failureResponse
 * @param  {String} statusCode status code of the failure response.
 * @param  {String} responseCode response code.
 * @param  {String} message response message.
 * @param {String} result - result
 * @returns {JSON} Returns response error
 */
const failureResponse = ({ message = 'Oops! Something Went Wrong.', statusCode = 500, responseCode }) => {
	const error = new Error(message)
	error.statusCode = statusCode
	error.responseCode = responseCode
	return error
}

module.exports = {
	successResponse,
	failureResponse,
}
