/**
 * name : middlewares/authenticator
 * author : Aman Kumar Gupta
 * Date : 21-Oct-2021
 * Description : Validating authorized requests
 */

const jwt = require('jsonwebtoken')

const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const userQueries = require('@database/queries/users')
const roleQueries = require('@database/queries/user_roles')

module.exports = async function (req, res, next) {
	try {
		let internalAccess = false
		let guestUrl = false
		let roleValidation = false

		const authHeader = req.get('X-auth-token')

		common.internalAccessUrls.map(function (path) {
			if (req.path.includes(path)) {
				if (
					req.headers.internal_access_token &&
					process.env.INTERNAL_ACCESS_TOKEN == req.headers.internal_access_token
				) {
					internalAccess = true
				}
			}
		})

		common.guestUrls.map(function (path) {
			if (req.path.includes(path)) {
				guestUrl = true
			}
		})

		common.roleValidationPaths.map(function (path) {
			if (req.path.includes(path)) {
				roleValidation = true
			}
		})

		if ((internalAccess || guestUrl) && !authHeader) {
			next()
			return
		}

		if (!authHeader) {
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

		//check for admin user
		let isAdmin = false
		if (decodedToken.data.roles) {
			isAdmin = decodedToken.data.roles.some((role) => role.title == common.roleAdmin)
			if (isAdmin) {
				req.decodedToken = decodedToken.data
				return next()
			}
		}

		if (roleValidation) {
			/* Invalidate token when user role is updated, say from mentor to mentee or vice versa */
			const user = await userQueries.findOne({ id: decodedToken.data.id })

			if (!user) {
				throw common.failureResponse({
					message: 'USER_NOT_FOUND',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}

			const roles = await roleQueries.findAll(
				{ id: user.roles, status: common.activeStatus },
				{ attributes: ['title'] }
			)

			//for the time being user have one role
			if (roles && roles[0].title !== decodedToken.data.roles[0].title) {
				throw common.failureResponse({
					message: 'USER_ROLE_UPDATED',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}
		}
		req.decodedToken = decodedToken.data
		next()
	} catch (err) {
		next(err)
	}
}
