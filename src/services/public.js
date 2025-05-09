const tenantDomainQueries = require('@database/queries/tenantDomain')
const tenantQueries = require('@database/queries/tenants')
const organizationQueries = require('@database/queries/organization')

const responses = require('@helpers/responses')
const httpStatusCode = require('@generics/http-status')

module.exports = class AccountHelper {
	static async tenantBranding(domain, organizationCode) {
		try {
			const notFoundResponse = (message) =>
				responses.failureResponse({
					message,
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
				})

			const tenantDomain = await tenantDomainQueries.findOne({ domain })
			if (!tenantDomain) {
				return notFoundResponse('TENANT_DOMAIN_NOT_FOUND_PING_ADMIN')
			}

			const tenantDetail = await tenantQueries.findOne({ code: tenantDomain.tenant_code }, {})

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
				result: {
					tenant: tenantDetail,
					...(orgDetails && { organization: orgDetails }),
				},
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}
}
