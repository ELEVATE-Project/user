const httpStatusCode = require('@generics/http-status')
const organizationFeatureQueries = require('@database/queries/organization-feature')
const responses = require('@helpers/responses')
module.exports = class organizationFeatureHelper {
	/**
	 * Create organization features.
	 * @method
	 * @name create
	 * @param {Object} bodyData
	 * @param {Object} tokenInformation
	 * @param {boolean} validateAvailabilityOfdefaultFeature
	 * @returns {JSON} - Organization feature creation data.
	 */

	static async create(bodyData, tokenInformation, validateAvailabilityOfdefaultFeature = false) {
		try {
			// validate availability of default feature in tenants default organization
			if (validateAvailabilityOfdefaultFeature) {
				const defaultFeature = await organizationFeatureQueries.findOne({
					feature_code: bodyData.feature_code,
					tenant_code: tokenInformation.tenant_code,
					organization_code: process.env.DEFAULT_TENANT_ORG_CODE,
				})

				// check if the default feature is available in tenant's default organization
				if (!defaultFeature) {
					return responses.failureResponse({
						message: 'DEFAULT_FEATURE_NOT_FOUND',
						statusCode: httpStatusCode.bad_request,
						responseCode: 'CLIENT_ERROR',
					})
				}
			}

			const organizationFeature = await organizationFeatureQueries.findOne({
				feature_code: bodyData.feature_code,
				organization_code: tokenInformation.organization_code,
				tenant_code: tokenInformation.tenant_code,
			})
			// check if the feature already exists
			if (organizationFeature) {
				return responses.failureResponse({
					message: 'ORGANIZATION_FEATURE_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			// Updating body data with organization code and tenant code
			bodyData['organization_code'] = tokenInformation.organization_code
			bodyData['tenant_code'] = tokenInformation.tenant_code
			bodyData['created_by'] = tokenInformation.id

			const createdOrgFeature = await organizationFeatureQueries.create(bodyData)

			return responses.successResponse({
				statusCode: httpStatusCode.created,
				message: 'ORG_FEATURE_CREATED_SUCCESSFULLY',
				result: createdOrgFeature,
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}
}
