/**
 * name : middlewares/authenticator
 * author : Aman Kumar Gupta
 * Date : 01-Oct-2021
 * Description : Validating authorized requests
 */
const httpStatusCode = require('@generics/http-status')
const apiResponses = require('@constants/api-responses')
const common = require('@constants/common')

module.exports = async function (req, res, next) {
	try {
		let internalAccess = false
		if (
			req.headers.internal_access_token &&
			process.env.INTERNAL_ACCESS_TOKEN == req.headers.internal_access_token
		) {
			internalAccess = true
		}
		if (internalAccess == true) {
			next()
			return
		} else {
			throw common.failureResponse({
				message: apiResponses.UNAUTHORIZED_REQUEST,
				statusCode: httpStatusCode.unauthorized,
				responseCode: 'UNAUTHORIZED',
			})
		}
	} catch (err) {
		next(err)
	}
}
