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
const roleQueries = require('@database/queries/userRole')
const rolePermissionMappingQueries = require('@database/queries/rolePermissionMapping')

async function checkPermissions(roleId, requestPath, requestMethod) {
	const filter = { role_id: roleId }
	const attributes = ['request_type', 'api_path', 'module']
	const allPermissions = await rolePermissionMappingQueries.find(filter, attributes)

	const matchingPermissions = allPermissions.filter((permission) =>
		requestPath.match(new RegExp('^' + permission.api_path.replace(/\*/g, '.*') + '$'))
	)

	const isPermissionValid = matchingPermissions.some((permission) => permission.request_type.includes(requestMethod))

	return isPermissionValid
}
const responses = require('@helpers/responses')

module.exports = async function (req, res, next) {
	const unAuthorizedResponse = responses.failureResponse({
		message: 'UNAUTHORIZED_REQUEST',
		statusCode: httpStatusCode.unauthorized,
		responseCode: 'UNAUTHORIZED',
	})
	try {
		let guestUrl = false
		let roleValidation = false

		const authHeader = req.get('X-auth-token')
		const internalAccess = common.internalAccessUrls.some((path) => {
			if (req.path.includes(path)) {
				if (req.headers.internal_access_token === process.env.INTERNAL_ACCESS_TOKEN) return true
				else throw unAuthorizedResponse
			}
			return false
		})

		common.roleValidationPaths.map(function (path) {
			if (req.path.includes(path)) {
				roleValidation = true
			}
		})

		if (internalAccess && !authHeader) {
			next()
			return
		}

		if (!authHeader) {
			try {
				const filters = { title: common.PUBLIC_ROLE }
				const attribute = ['id']
				const roleId = await roleQueries.findAllRoles(filters, attribute)
				const isPermissionValid = await checkPermissions(roleId.rows[0].id, req.path, req.method)

				if (!isPermissionValid) {
					throw failureResponse({
						message: 'PERMISSION_DENIED',
						statusCode: httpStatusCode.unauthorized,
						responseCode: 'UNAUTHORIZED',
					})
				}

				return next()
			} catch (error) {
				throw failureResponse({
					message: 'UNAUTHORIZED_REQUEST',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}
		}

		// let splittedUrl = req.url.split('/');
		// if (common.uploadUrls.includes(splittedUrl[splittedUrl.length - 1])) {
		//     if (!req.headers.internal_access_token || process.env.INTERNAL_ACCESS_TOKEN !== req.headers.internal_access_token) {
		//         throw responses.failureResponse({ message: apiResponses.INCORRECT_INTERNAL_ACCESS_TOKEN, statusCode: httpStatusCode.unauthorized, responseCode: 'UNAUTHORIZED' });
		//     }
		// }
		const authHeaderArray = authHeader.split(' ')
		if (authHeaderArray[0] !== 'bearer') throw unAuthorizedResponse

		try {
			decodedToken = jwt.verify(authHeaderArray[1], process.env.ACCESS_TOKEN_SECRET)
		} catch (err) {
			if (err.name === 'TokenExpiredError') {
				throw responses.failureResponse({
					message: 'ACCESS_TOKEN_EXPIRED',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			} else throw unAuthorizedResponse
		}

		if (!decodedToken) throw unAuthorizedResponse

		//check for admin user
		let isAdmin = false
		if (decodedToken.data.roles) {
			isAdmin = decodedToken.data.roles.some((role) => role.title == common.ADMIN_ROLE)
			if (isAdmin) {
				req.decodedToken = decodedToken.data
				return next()
			}
		}

		if (roleValidation) {
			/* Invalidate token when user role is updated, say from mentor to mentee or vice versa */
			const user = await userQueries.findByPk(decodedToken.data.id)
			if (!user) {
				throw responses.failureResponse({
					message: 'USER_NOT_FOUND',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}

			const roles = await roleQueries.findAll(
				{ id: user.roles, status: common.ACTIVE_STATUS },
				{ attributes: ['id', 'title', 'user_type', 'status'] }
			)

			//update the token role as same as current user role
			decodedToken.data.roles = roles
			decodedToken.data.organization_id = user.organization_id
		}

		const isPermissionValid = await checkPermissions(
			decodedToken.data.roles.map((role) => role.id),
			req.path,
			req.method
		)
		if (!isPermissionValid) {
			throw common.failureResponse({
				message: 'PERMISSION_DENIED',
				statusCode: httpStatusCode.unauthorized,
				responseCode: 'UNAUTHORIZED',
			})
		}

		req.decodedToken = decodedToken.data
		return next()
	} catch (err) {
		next(err)
	}
}
