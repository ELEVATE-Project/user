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

async function fetchApiPermissions(path) {
	try {
		return new Promise((resolve, reject) => {
			const apiEntry = common.apiPermissionsUrls.find((entry) => entry.path === path)

			if (apiEntry) {
				resolve({ actions: apiEntry.actions, module: apiEntry.module })
			} else {
				resolve({ actions: null, module: null })
			}
		})
	} catch (error) {
		throw error
	}
}

module.exports = async function (req, res, next) {
	try {
		let internalAccess = false
		let guestUrl = false
		let roleValidation = false
		let apiPermissions = false
		let decodedToken

		const authHeader = req.get('X-auth-token')

		common.internalAccessUrs.map(function (path) {
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

		common.apiPermissionsUrls.forEach((entry) => {
			if (req.path.includes(entry.path)) {
				apiPermissions = true
			}
		})

		if ((internalAccess || guestUrl || apiPermissions) && !authHeader) {
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
			const filter = { role_id: roleIds }
			const attributes = ['actions', 'module']
			const [requiredPermission, rolePermission] = await Promise.all([
				fetchApiPermissions(req.path),
				rolePermissionMappingQueries.find(filter, attributes),
			])

			const isMatchingEntry = rolePermission.some((entry) => {
				const actionsMatch =
					entry.actions.length === requiredPermission.actions.length &&
					entry.actions.every((action, index) => action === requiredPermission.actions[index])
				return actionsMatch && entry.module === requiredPermission.module
			})

			if (!isMatchingEntry) {
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
		next()
	} catch (err) {
		console.log(err)
		next(err)
	}
}
