const tenantDomainQueries = require('@database/queries/tenantDomain')
const tenantQueries = require('@database/queries/tenants')
const organizationQueries = require('@database/queries/organization')
const userQueries = require('@database/queries/users')

const responses = require('@helpers/responses')
const httpStatusCode = require('@generics/http-status')

const tenantTransformDTO = require('@dtos/tenantDTO') // Path to your DTO file

module.exports = class AccountHelper {
	static async tenantBranding(domain = null, organizationCode, tenantCode = null) {
		try {
			const notFoundResponse = (message) =>
				responses.failureResponse({
					message,
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
				})

			if (!tenantCode && !domain) {
				return notFoundResponse('TENANT_DOMAIN_NOT_FOUND_PING_ADMIN')
			}
			let code = tenantCode
			if (!code) {
				const tenantDomain = await tenantDomainQueries.findOne({ domain })
				code = tenantDomain?.tenant_code
			}
			if (!code) return notFoundResponse('TENANT_NOT_FOUND_PING_ADMIN')
			const tenantDetail = await tenantQueries.findOne({ code }, {})

			if (!tenantDetail) {
				return notFoundResponse('TENANT_NOT_FOUND_PING_ADMIN')
			}
			let orgDetails
			if (organizationCode) {
				orgDetails = await organizationQueries.findOne({
					code: organizationCode,
					tenant_code: tenantDomain.tenant_code,
				})
			}
			return responses.successResponse({
				statusCode: httpStatusCode.created,
				message: 'TENANT_DETAILS',
				result: tenantTransformDTO.publicTransform({
					tenant: tenantDetail,
					...(orgDetails && { organization: orgDetails }),
				}),
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	static async checkUsername(username, domain) {
		try {
			const notFoundResponse = (message) =>
				responses.failureResponse({
					message,
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
				})

			const tenantDomain = await tenantDomainQueries.findOne(
				{ domain },
				{
					attributes: ['tenant_code'],
				}
			)
			if (!tenantDomain) {
				return notFoundResponse('TENANT_DOMAIN_NOT_FOUND_PING_ADMIN')
			}

			const tenantDetail = await tenantQueries.findOne(
				{ code: tenantDomain.tenant_code },
				{ attributes: ['code'] }
			)

			if (!tenantDetail) {
				return notFoundResponse('TENANT_NOT_FOUND_PING_ADMIN')
			}

			const existingUser = await userQueries.findOne(
				{
					username: username,
					tenant_code: tenantDetail.code,
				},
				{
					attributes: ['id'],
				}
			)

			const isTaken = !!existingUser

			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: isTaken ? 'USERNAME_TAKEN' : 'USERNAME_AVAILABLE',
				result: { available: !isTaken },
			})
		} catch (error) {
			console.error(error)
			throw error
		}
	}
}
