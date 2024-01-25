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

module.exports = async function (req, res, next) {
	try {
		let internalAccess = false
		let roleValidation = false

		const authHeader = req.get('X-auth-token')

		common.internalAccessUrls.map(function (path) {
			if (req.path.includes(path)) {
				console.log('REQUEST PATH: ', req.path)
				console.log('INTERNAL ACCESS PATH: ', path)
				if (
					req.headers.internal_access_token &&
					process.env.INTERNAL_ACCESS_TOKEN == req.headers.internal_access_token
				) {
					internalAccess = true
				}
			}
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
				const id = roleId.rows[0].id

				const filter = { role_id: id }
				const attributes = ['request_type', 'api_path', 'module']
				const allPermissions = await rolePermissionMappingQueries.find(filter, attributes)

				const matchingPermissions = allPermissions.filter((permission) =>
					req.path.match(new RegExp('^' + permission.api_path.replace(/\*/g, '.*') + '$'))
				)

				const isPermissionValid = matchingPermissions.some((permission) =>
					permission.request_type.includes(req.method)
				)

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
			if (err.name === 'TokenExpiredError') {
				throw common.failureResponse({
					message: 'ACCESS_TOKEN_EXPIRED',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			} else {
				throw common.failureResponse({
					message: 'UNAUTHORIZED_REQUEST',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}
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
				throw common.failureResponse({
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

		const roleIds = decodedToken.data.roles.map((role) => role.id)
		const filter = { role_id: roleIds }
		const attributes = ['request_type', 'api_path', 'module']
		const allPermissions = await rolePermissionMappingQueries.find(filter, attributes)
		const matchingPermissions = allPermissions.filter((permission) =>
			req.path.match(new RegExp('^' + permission.api_path.replace(/\*/g, '.*') + '$'))
		)

		const isPermissionValid = matchingPermissions.some((permission) => permission.request_type.includes(req.method))

		if (!isPermissionValid) {
			throw common.failureResponse({
				message: 'PERMISSION_DENIED',
				statusCode: httpStatusCode.unauthorized,
				responseCode: 'UNAUTHORIZED',
			})
		}

		req.decodedToken = decodedToken.data
		next()
	} catch (err) {
		next(err)
	}
}
