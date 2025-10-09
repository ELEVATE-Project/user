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

const rolePermissionMappingQueries = require('@database/queries/role-permission-mapping')
const { Op } = require('sequelize')
const responses = require('@helpers/responses')
const utilsHelper = require('@generics/utils')
const { verifyCaptchaToken } = require('@utils/captcha')
const { getDomainFromRequest } = require('@utils/domain')
const tenantDomainQueries = require('@database/queries/tenantDomain')

async function checkPermissions(roleTitle, requestPath, requestMethod) {
	const parts = requestPath.match(/[^/]+/g)
	const api_path = [`/${parts[0]}/${parts[1]}/${parts[2]}/*`]

	if (parts[4]) api_path.push(`/${parts[0]}/${parts[1]}/${parts[2]}/${parts[3]}*`)
	else
		api_path.push(
			`/${parts[0]}/${parts[1]}/${parts[2]}/${parts[3]}`,
			`/${parts[0]}/${parts[1]}/${parts[2]}/${parts[3]}*`
		)

	if (Array.isArray(roleTitle) && !roleTitle.includes(common.PUBLIC_ROLE)) {
		roleTitle.push(common.PUBLIC_ROLE)
	}

	const filter = { role_title: roleTitle, module: parts[2], api_path: { [Op.in]: api_path } }
	const attributes = ['request_type', 'api_path', 'module']
	const allowedPermissions = await rolePermissionMappingQueries.findAll(filter, attributes)

	const isPermissionValid = allowedPermissions.some((permission) => {
		return permission.request_type.includes(requestMethod)
	})
	return isPermissionValid
}

const notFoundResponse = (message) =>
	responses.failureResponse({
		message,
		statusCode: httpStatusCode.not_acceptable,
		responseCode: 'CLIENT_ERROR',
	})

module.exports = async function (req, res, next) {
	const unAuthorizedResponse = responses.failureResponse({
		message: 'UNAUTHORIZED_REQUEST',
		statusCode: httpStatusCode.unauthorized,
		responseCode: 'UNAUTHORIZED',
	})
	try {
		let roleValidation = false

		const authHeader = req.get('X-auth-token')
		const internalAccess = common.internalAccessUrls.some((path) => {
			if (req.path.includes(path)) {
				if (req.headers.internal_access_token === process.env.INTERNAL_ACCESS_TOKEN) return true
				else if (!authHeader) {
					throw unAuthorizedResponse
				}
			}
			return false
		})

		// check if captcha check is enabled in the env
		const isCaptchaEnabled = process.env.CAPTCHA_ENABLE.toLowerCase() == 'true'

		if (isCaptchaEnabled) {
			// check if captcha is enabled for the route
			const isCaptchaEnabledForRoute = common.captchaEnabledAPIs.includes(req.path)
			if (isCaptchaEnabledForRoute) {
				// get the token from API
				const captchaToken = req.get('captcha-token')
				// verify token
				if (!(await verifyCaptchaToken(captchaToken))) {
					throw responses.failureResponse({
						message: 'CAPTCHA_VERIFICATION_FAILED',
						statusCode: httpStatusCode.unauthorized,
						responseCode: 'UNAUTHORIZED',
					})
				}
			}
		}

		common.roleValidationPaths.map(function (path) {
			if (req.path.includes(path)) {
				roleValidation = true
			}
		})

		if (internalAccess && !authHeader) return next()

		if (!authHeader) {
			try {
				const isPermissionValid = await checkPermissions(common.PUBLIC_ROLE, req.path, req.method)
				if (!isPermissionValid) {
					throw responses.failureResponse({
						message: 'PERMISSION_DENIED',
						statusCode: httpStatusCode.unauthorized,
						responseCode: 'UNAUTHORIZED',
					})
				}

				const domain = getDomainFromRequest(req) || null
				const tenant_code =
					req?.headers?.tenantId ||
					req?.headers?.tenantid ||
					req?.headers?.tenant_Id ||
					req?.headers?.tenant_id ||
					req?.headers?.tenant ||
					req?.headers?.tenant_code ||
					req.headers.tenantCode ||
					null

				const tenantFilter = domain ? { domain } : tenant_code ? { tenant_code } : null || {}

				if (Object.keys(tenantFilter).length > 0) {
					const tenantDomain = await tenantDomainQueries.findOne(tenantFilter, {
						attributes: ['tenant_code'],
					})
					if (!tenantDomain) {
						throw notFoundResponse('TENANT_DOMAIN_NOT_FOUND_PING_ADMIN')
					}

					req.body.tenant_code = tenantDomain.tenant_code
				} else {
					throw notFoundResponse('TENANT_DOMAIN_NOT_FOUND_PING_ADMIN')
				}

				return next()
			} catch (error) {
				if (error.message == 'UNAUTHORIZED_REQUEST') throw unAuthorizedResponse
				throw error
			}
		}

		// let splittedUrl = req.url.split('/');
		// if (common.uploadUrls.includes(splittedUrl[splittedUrl.length - 1])) {
		//     if (!req.headers.internal_access_token || process.env.INTERNAL_ACCESS_TOKEN !== req.headers.internal_access_token) {
		//         throw responses.failureResponse({ message: apiResponses.INCORRECT_INTERNAL_ACCESS_TOKEN, statusCode: httpStatusCode.unauthorized, responseCode: 'UNAUTHORIZED' });
		//     }
		// }
		// const authHeaderArray = authHeader.split(' ')
		// if (authHeaderArray[0] !== 'bearer') throw unAuthorizedResponse

		let token
		if (process.env.IS_AUTH_TOKEN_BEARER === 'true') {
			const [authType, extractedToken] = authHeader.split(' ')
			if (authType.toLowerCase() !== 'bearer') throw unAuthorizedResponse
			token = extractedToken.trim()
		} else token = authHeader.trim()

		let decodedToken
		let org
		try {
			decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

			org = decodedToken.data.organizations?.[0]

			const organization_id = org?.id
			const organization_code = org?.code

			decodedToken.data = {
				id: decodedToken.data.id,
				name: decodedToken.data.name,
				session_id: decodedToken.data.session_id,
				tenant_code: decodedToken.data.tenant_code,
				organization_id,
				organization_code,
				roles: org.roles,
			}
			// Get redis key for session
			const sessionId = decodedToken.data.session_id.toString()
			// Get data from redis
			const redisData = await utilsHelper.redisGet(sessionId)

			// If data is not in redis, token is invalid
			if (!redisData || redisData.accessToken !== token) {
				throw responses.failureResponse({
					message: 'USER_SESSION_NOT_FOUND',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}

			// Renew the TTL if allowed idle time is greater than zero
			if (process.env.ALLOWED_IDLE_TIME != null) {
				await utilsHelper.redisSet(sessionId, redisData, process.env.ALLOWED_IDLE_TIME)
			}
		} catch (err) {
			if (err.name === 'TokenExpiredError' || err.message === 'USER_SESSION_NOT_FOUND') {
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
		}

		if (isAdmin) {
			// For admin users, allow overriding tenant_code, organization_id, and organization_code via headers
			// Header names are configurable via environment variables with sensible defaults
			const orgIdHeaderName = process.env.ORG_ID_HEADER_NAME
			const orgCodeHeaderName = process.env.ORG_CODE_HEADER_NAME
			const tenantCodeHeaderName = process.env.TENANT_CODE_HEADER_NAME

			// Extract and sanitize header values (trim whitespace, case-insensitive header lookup)
			const orgId = (req.headers[orgIdHeaderName.toLowerCase()] || '').trim()
			const orgCode = (req.headers[orgCodeHeaderName.toLowerCase()] || '').trim()
			const tenantCode = (req.headers[tenantCodeHeaderName.toLowerCase()] || '').trim()

			// If any override header is provided (non-empty after trim), all three must be present and non-empty
			const hasAnyOverrideHeader = orgId || orgCode || tenantCode
			if (hasAnyOverrideHeader) {
				if (!orgId || !orgCode || !tenantCode) {
					throw responses.failureResponse({
						message: {
							key: 'ADD_ORG_HEADER',
							interpolation: {
								orgIdHeader: orgIdHeaderName,
								orgCodeHeader: orgCodeHeaderName,
								tenantCodeHeader: tenantCodeHeaderName,
							},
						},
						statusCode: httpStatusCode.bad_request,
						responseCode: 'CLIENT_ERROR',
					})
				}

				// Validate orgId is a valid positive integer
				const parsedOrgId = parseInt(orgId, 10)
				if (isNaN(parsedOrgId) || parsedOrgId <= 0) {
					throw responses.failureResponse({
						message: 'INVALID_ORG_ID',
						statusCode: httpStatusCode.bad_request,
						responseCode: 'CLIENT_ERROR',
					})
				}

				// Override the values from the token with sanitized header values
				decodedToken.data.tenant_code = tenantCode
				decodedToken.data.organization_id = parsedOrgId
				decodedToken.data.organization_code = orgCode
			}

			req.decodedToken = decodedToken.data
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

			const roles = org.roles

			//update the token role as same as current user role
			decodedToken.data.roles = roles //TODO: Update this to get roles from the user org roles table
			//decodedToken.data.organization_id = user.organization_id
		}

		const isPermissionValid = await checkPermissions(
			decodedToken.data.roles.map((role) => role.title),
			req.path,
			req.method
		)
		if (!isPermissionValid) {
			throw responses.failureResponse({
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
