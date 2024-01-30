/**
 * name : middlewares/authenticator
 * author : Aman Kumar Gupta
 * Date : 04-Nov-2021
 * Description : Validating authorized requests
 */

const jwt = require('jsonwebtoken')

const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const requests = require('@generics/requests')
const endpoints = require('@constants/endpoints')
const rolePermissionMappingQueries = require('@database/queries/rolePermissionMapping')
const permissionsQueries = require('@database/queries/permissions')

module.exports = async function (req, res, next) {
	const unAuthorizedResponse = common.failureResponse({
		message: 'UNAUTHORIZED_REQUEST',
		statusCode: httpStatusCode.unauthorized,
		responseCode: 'UNAUTHORIZED',
	})
	try {
		let guestUrl = false
		let roleValidation = false
		let apiPermissions = false
		let decodedToken

		const authHeader = req.get('X-auth-token')

		const internalAccess = common.internalAccessUrls.some((path) => {
			if (req.path.includes(path)) {
				if (req.headers.internal_access_token === process.env.INTERNAL_ACCESS_TOKEN) return true
				else throw unAuthorizedResponse
			}
			return false
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
		common.apiPermissionsUrls.map(function (path) {
			if (req.path.includes(path)) {
				apiPermissions = true
			}
		})

		if ((internalAccess || guestUrl || apiPermissions) && !authHeader) return next()

		if (!authHeader) throw unAuthorizedResponse

		const authHeaderArray = authHeader.split(' ')
		if (authHeaderArray[0] !== 'bearer') throw unAuthorizedResponse

		try {
			decodedToken = jwt.verify(authHeaderArray[1], process.env.ACCESS_TOKEN_SECRET)
		} catch (err) {
			if (err.name === 'TokenExpiredError') {
				throw common.failureResponse({
					message: 'ACCESS_TOKEN_EXPIRED',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			} else throw unAuthorizedResponse
		}

		if (!decodedToken) throw unAuthorizedResponse

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
			const userBaseUrl = process.env.USER_SERVICE_HOST + process.env.USER_SERVICE_BASE_URL
			const profileUrl = userBaseUrl + endpoints.USER_PROFILE_DETAILS + '/' + decodedToken.data.id
			const user = await requests.get(profileUrl, null, true)
			if (!user || !user.success) {
				throw common.failureResponse({
					message: 'USER_NOT_FOUND',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}

			if (user.data.result.deleted_at !== null) {
				throw common.failureResponse({
					message: 'USER_ROLE_UPDATED',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}

			decodedToken.data.roles = user.data.result.user_roles
			decodedToken.data.organization_id = user.data.result.organization_id
		}

		if (apiPermissions) {
			const roleIds = decodedToken.data.roles.map((role) => role.id)
			const filter = { role_id: roleIds, api_path: req.path }
			const attributes = ['request_type', 'api_path', 'module']
			const requiredPermissions = await rolePermissionMappingQueries.find(filter, attributes)

			const isPermissionValid = requiredPermissions.some(
				(permission) => permission.api_path === req.path && permission.request_type.includes(req.method)
			)

			if (!isPermissionValid) {
				throw common.failureResponse({
					message: 'PERMISSION_DENIED',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}
		}

		req.decodedToken = {
			id: decodedToken.data.id,
			roles: decodedToken.data.roles,
			name: decodedToken.data.name,
			token: authHeader,
			organization_id: decodedToken.data.organization_id,
		}
		return next()
	} catch (err) {
		console.log(err)
		next(err)
	}
}
