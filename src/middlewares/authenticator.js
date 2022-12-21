/**
 * name : middlewares/authenticator
 * author : Aman Kumar Gupta
 * Date : 21-Oct-2021
 * Description : Validating authorized requests
 */

const jwt = require('jsonwebtoken')

const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const UsersData = require('@db/users/queries')
const { logger } = require('@log/logger')

module.exports = async function (req, res, next) {
	try {
		let internalAccess = false
		await Promise.all(
			common.internalAccessUrls.map(async function (path) {
				if (req.path.includes(path)) {
					//console.log('>>>>>>>>>>>>>>>>>>>>>>>', req.headers.internal_access_token)
					if (
						req.headers.internal_access_token &&
						process.env.INTERNAL_ACCESS_TOKEN == req.headers.internal_access_token
					) {
						internalAccess = true
					}
				}
			})
		)

		if (internalAccess == true) {
			next()
			return
		} else if (!common.guestUrls.includes(req.url)) {
			const authHeader = req.get('X-auth-token')
			//console.log(authHeader)
			if (!authHeader) {
				logger.info('recjected1')
				throw common.failureResponse({
					message: 'UNAUTHORIZED_REQUEST',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}

			// let splittedUrl = req.url.split('/');
			// if (common.uploadUrls.includes(splittedUrl[splittedUrl.length - 1])) {
			//     if (!req.headers.internal_access_token || process.env.INTERNAL_ACCESS_TOKEN !== req.headers.internal_access_token) {
			//         throw common.failureResponse({ message: apiResponses.INCORRECT_INTERNAL_ACCESS_TOKEN, statusCode: httpStatusCode.unauthorized, responseCode: 'UNAUTHORIZED' });
			//     }
			// }

			const authHeaderArray = authHeader.split(' ')
			if (authHeaderArray[0] !== 'bearer') {
				throw common.failureResponse({
					message: 'UNAUTHORIZED_REQUEST',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}
			try {
				decodedToken = jwt.verify(authHeaderArray[1], process.env.ACCESS_TOKEN_SECRET)
				//logger.info(decodedToken)
			} catch (err) {
				err.statusCode = httpStatusCode.unauthorized
				err.responseCode = 'UNAUTHORIZED'
				err.message = 'ACCESS_TOKEN_EXPIRED'
				throw err
			}

			if (!decodedToken) {
				throw common.failureResponse({
					message: 'UNAUTHORIZED_REQUEST',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}

			/* Invalidate token when user role is updated, say from mentor to mentee or vice versa */
			const user = await UsersData.findOne({ _id: decodedToken.data._id })

			if (user && user.isAMentor !== decodedToken.data.isAMentor) {
				throw common.failureResponse({
					message: 'USER_ROLE_UPDATED',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}

			req.decodedToken = decodedToken.data
		}

		next()
	} catch (err) {
		logger.error(err)
		next(err)
	}
}
