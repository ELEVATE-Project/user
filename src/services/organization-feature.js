const httpStatusCode = require('@generics/http-status')
const organizationFeatureQueries = require('@database/queries/organization-feature')
const responses = require('@helpers/responses')
module.exports = class organizationFeatureHelper {
	/**
	 * Create organization features.
	 * @method
	 * @name create
	 * @param {Object} bodyData - Req Body
	 * @param {Object} tokenInformation - Token Information
	 * @param {boolean} isAdmin
	 * @returns {JSON} - Organization feature creation data.
	 */

	static async create(bodyData, tokenInformation, isAdmin = false) {
		try {
			// validate availability of default feature in tenants default organization
			if (!isAdmin && tokenInformation.organization_code != process.env.DEFAULT_TENANT_ORG_CODE) {
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
			bodyData.organization_code = tokenInformation.organization_code
			bodyData.tenant_code = tokenInformation.tenant_code
			bodyData.created_by = tokenInformation.id

			const createdOrgFeature = await organizationFeatureQueries.create(bodyData)
			console.log(createdOrgFeature, 'createdOrgFeature')
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

	/**
	 * List organization features.
	 * @method
	 * @name list
	 * @param {Object} tokenInformation - Token Information
	 * @returns {JSON} - Organization feature list.
	 */

	static async list(tokenInformation) {
		try {
			const organizationFeatures = await organizationFeatureQueries.findAllOrganizationFeature(
				{
					organization_code: tokenInformation.organization_code,
					tenant_code: tokenInformation.tenant_code,
				},
				{
					attributes: {
						exclude: ['created_by', 'updated_by', 'created_at', 'updated_at', 'deleted_at'],
					},
				}
			)

			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'ORG_FEATURE_FETCHED',
				result: !organizationFeatures?.length > 0 ? [] : organizationFeatures,
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * read organization features.
	 * @method
	 * @name read
	 * @param {String} featureCode - Feature code
	 * @param {Object} tokenInformation - Token Information
	 * @returns {JSON} - Organization feature list.
	 */

	static async read(featureCode, tokenInformation) {
		try {
			const organizationFeature = await organizationFeatureQueries.findOne({
				feature_code: featureCode,
				organization_code: tokenInformation.organization_code,
				tenant_code: tokenInformation.tenant_code,
			})

			if (!organizationFeature?.tenant_code) {
				return responses.failureResponse({
					message: 'ORG_FEATURE_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'ORG_FEATURE_FETCHED',
				result: organizationFeature,
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * Delete organization feature.
	 * @method
	 * @name delete
	 * @param {String} featureCode - Feature Code
	 * @param {Object} tokenInformation - Token Information
	 * @returns {JSON} - feature deleted response.
	 */
	static async delete(featureCode, tokenInformation) {
		try {
			const { organization_code, tenant_code } = tokenInformation

			const deleteResult = await organizationFeatureQueries.delete(featureCode, organization_code, tenant_code)

			if (!deleteResult || deleteResult === 0) {
				return responses.failureResponse({
					message: 'ORG_FEATURE_NOT_FOUND',
					statusCode: httpStatusCode.not_found,
					responseCode: 'CLIENT_ERROR',
				})
			}

			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'ORG_FEATURE_DELETED_SUCCESSFULLY',
				result: {},
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * Update organization feature.
	 * @method
	 * @name delete
	 * @param {String} bodyData - req body.
	 * @param {String} tokenInformation - Token information
	 * @returns {JSON} - feature deleted response.
	 */
	static async update(bodyData, tokenInformation) {
		try {
			let filterQuery = {
				feature_code: bodyData.feature_code,
				organization_code: tokenInformation.organization_code,
				tenant_code: tokenInformation.tenant_code,
			}

			bodyData.updated_by = tokenInformation.id

			const [updatedCount, updatedOrgFeature] = await organizationFeatureQueries.updateOrganizationFeature(
				filterQuery,
				bodyData
			)

			if (updatedCount === 0) {
				return responses.failureResponse({
					message: 'FAILED_TO_UPDATE_ORG_FEATURE',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'ORG_FEATURE_UPDATED_SUCCESSFULLY',
				result: updatedOrgFeature?.[0],
			})
		} catch (error) {
			throw error
		}
	}
}
