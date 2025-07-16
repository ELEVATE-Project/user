/**
 * name : organization-feature.js
 * author : Priyanka Pradeep
 * created-date : 02-Jun-2025
 * Description : organization-feature helper.
 */

const httpStatusCode = require('@generics/http-status')
const organizationFeatureQueries = require('@database/queries/organization-feature')
const organizationQueries = require('@database/queries/organization')
const responses = require('@helpers/responses')
const utilsHelper = require('@generics/utils')
const { UniqueConstraintError } = require('sequelize')
const common = require('@constants/common')

module.exports = class organizationFeatureHelper {
	/**
	 * Validate organization features Req.
	 * @method
	 * @name validateAndUpdateToken
	 * @param {Object} Req - Req
	 * @returns {Boolean} - return error or boolean
	 */
	static async validateAndUpdateToken(req) {
		const roles = req.decodedToken.roles
		// check if user roles are admin or org admin
		if (!utilsHelper.validateRoleAccess(roles, [common.ADMIN_ROLE, common.ORG_ADMIN_ROLE])) {
			throw responses.failureResponse({
				message: 'USER_IS_NOT_ADMIN',
				statusCode: httpStatusCode.bad_request,
				responseCode: 'CLIENT_ERROR',
			})
		}

		// if user is admin replace organization code & tenant code form header
		const isAdmin = utilsHelper.validateRoleAccess(roles, [common.ADMIN_ROLE])
		if (isAdmin) {
			const orgCode = req.header(common.ORG_CODE_HEADER)
			const tenantCode = req.header(common.TENANT_CODE_HEADER)
			if (orgCode) req.decodedToken.organization_code = orgCode
			if (tenantCode) req.decodedToken.tenant_code = tenantCode
		}

		if (!req.decodedToken.organization_code || !req.decodedToken.tenant_code) {
			throw responses.failureResponse({
				message: 'ORGANIZATION_CODE_OR_TENANT_CODE_NOT_FOUND',
				statusCode: httpStatusCode.bad_request,
				responseCode: 'CLIENT_ERROR',
			})
		}

		return isAdmin
	}

	/**
	 * Create organization features.
	 * @method
	 * @name create
	 * @param {Object} bodyData - Req Body
	 * @param {Object} tokenInformation - Token Information
	 * @param {boolean} isAdmin
	 * @returns {JSON} - Organization feature creation response.
	 */

	static async create(bodyData, tokenInformation, isAdmin = false) {
		try {
			// validate that the feature exists in the default organization
			if (!isAdmin && tokenInformation.organization_code != process.env.DEFAULT_TENANT_ORG_CODE) {
				const defaultFeature = await organizationFeatureQueries.findOne({
					feature_code: bodyData.feature_code,
					tenant_code: tokenInformation.tenant_code,
					organization_code: process.env.DEFAULT_TENANT_ORG_CODE,
					enabled: true,
				})
				// If the feature is not available in the default organization, return an error
				if (!defaultFeature) {
					return responses.failureResponse({
						message: 'FEATURE_NOT_FOUND',
						statusCode: httpStatusCode.bad_request,
						responseCode: 'CLIENT_ERROR',
					})
				}
				// Else, attach the default display_order from default organization
				else {
					bodyData.display_order = defaultFeature.display_order
				}
			}

			// Add organization and tenant details to the payload before creation
			bodyData.organization_code = tokenInformation.organization_code
			bodyData.tenant_code = tokenInformation.tenant_code
			bodyData.created_by = tokenInformation.id

			// Create the new organization feature
			const createdOrgFeature = await organizationFeatureQueries.create(bodyData)
			return responses.successResponse({
				statusCode: httpStatusCode.created,
				message: 'ORG_FEATURE_CREATED_SUCCESSFULLY',
				result: createdOrgFeature,
			})
		} catch (error) {
			if (error.name === common.SEQUELIZE_FOREIGN_KEY_CONSTRAINT_ERROR) {
				return responses.failureResponse({
					message: 'FEATURE_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			} else if (error instanceof UniqueConstraintError) {
				return responses.failureResponse({
					message: 'ORGANIZATION_FEATURE_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			throw error
		}
	}

	/**
	 * Update organization feature.
	 * @method
	 * @name update
	 * @param {String} bodyData - req body.
	 * @param {String} tokenInformation - Token information
	 * @returns {JSON} - Org feature update response.
	 */
	static async update(feature_code, bodyData, tokenInformation) {
		try {
			// Prepare filter query to identify the organization feature to update
			let filterQuery = {
				feature_code: feature_code,
				organization_code: tokenInformation.organization_code,
				tenant_code: tokenInformation.tenant_code,
			}

			bodyData.updated_by = tokenInformation.id

			const [updatedCount, updatedOrgFeature] = await organizationFeatureQueries.updateOrganizationFeature(
				filterQuery,
				bodyData
			)

			// Return error if no record was updated
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
			if (error.name === common.SEQUELIZE_FOREIGN_KEY_CONSTRAINT_ERROR) {
				return responses.failureResponse({
					message: 'FEATURE_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
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

	static async list(tenantCode, orgCode) {
		try {
			let filter = {
				organization_code: orgCode,
				tenant_code: tenantCode,
			}
			const queryOptions = {
				attributes: {
					exclude: ['created_by', 'updated_by', 'created_at', 'updated_at', 'deleted_at'],
				},
			}

			// Fetch features for default and current org in parallel
			const [defaultOrgFeatures, currentOrgFeatures] = await Promise.all([
				organizationFeatureQueries.findAllOrganizationFeature(
					{ ...filter, organization_code: process.env.DEFAULT_ORGANISATION_CODE },
					queryOptions
				),
				organizationFeatureQueries.findAllOrganizationFeature(filter, queryOptions),
			])

			// Merge features with Map for efficiency
			const featureMap = new Map(defaultOrgFeatures.map((feature) => [feature.feature_code, feature]))

			// Override with current org features if they exist
			if (currentOrgFeatures?.length) {
				currentOrgFeatures.forEach((feature) => {
					featureMap.set(feature.feature_code, feature)
				})
			}

			const organizationFeatures = Array.from(featureMap.values())

			// Sort the organization features based on the display_order in ascending order
			const sortedFeatures = organizationFeatures.sort((a, b) => a.display_order - b.display_order)

			// Process icons in parallel
			if (sortedFeatures?.length) {
				await Promise.all(
					sortedFeatures.map(async (feature) => {
						if (feature.icon) {
							feature.icon = await utilsHelper.getDownloadableUrl(feature.icon)
						}
					})
				)
			}

			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'ORG_FEATURE_FETCHED',
				result: sortedFeatures ?? [],
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
	 * @returns {JSON} - Organization feature detail response.
	 */

	static async read(featureCode, tenantCode, orgCode) {
		try {
			let filter = {
				feature_code: featureCode,
				organization_code: orgCode,
				tenant_code: tenantCode,
			}

			// Fetch a specific organization feature by feature code, organization, and tenant
			let organizationFeature = await organizationFeatureQueries.findOne(filter)
			if (!organizationFeature?.tenant_code) {
				let defaultOrg = await organizationQueries.findOne(
					{ code: process.env.DEFAULT_ORGANISATION_CODE, tenant_code: tenantCode },
					{ attributes: ['id', 'code'] }
				)

				filter.organization_code = defaultOrg.code
				organizationFeature = await organizationFeatureQueries.findOne(filter)
			}

			// Return error if the organization feature is not found
			if (!organizationFeature?.tenant_code) {
				return responses.failureResponse({
					message: 'ORG_FEATURE_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			if (organizationFeature?.icon) {
				organizationFeature.icon = await utilsHelper.getDownloadableUrl(organizationFeature.icon)
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

			// If no feature was deleted, return a not found error
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
}
