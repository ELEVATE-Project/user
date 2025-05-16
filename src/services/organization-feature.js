const httpStatusCode = require('@generics/http-status')
const organizationFeatureQueries = require('@database/queries/organization-feature')

module.exports = class NotificationTemplateHelper {
	/**
	 * Create organization features.
	 * @method
	 * @name create
	 * @param {Object} bodyData
	 * @param {Object} tokenInformation
	 * @returns {JSON} - Organization feature creation data.
	 */

	static async create(bodyData, tokenInformation) {
		try {
			const organizationFeature = await organizationFeatureQueries.findOne({
				feature_code: bodyData.feature_code,
				organization_code: tokenInformation.organization_code,
				tenant_code: tokenInformation.tenant_code,
				enabled: true,
			})
			// check if the feature already exists
			if (organizationFeature) {
				return responses.failureResponse({
					message: 'ORGANIZATION_FEATURE_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

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
