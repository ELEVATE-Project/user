const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')
const OrganisationExtensionQueries = require('@database/queries/organisationextension')
const { successResponse } = require('@constants/common')

module.exports = class orgAdminHelper {
	static async setOrgPolicies(decodedToken, policies) {
		try {
			if (decodedToken.roles.some((role) => role.title !== common.ORG_ADMIN_ROLE)) {
				return common.failureResponse({
					message: 'UNAUTHORIZED_REQUEST',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}
			const orgPolicies = await OrganisationExtensionQueries.create({
				org_id: decodedToken.organization_id,
				...policies,
			})
			console.log(orgPolicies)
			delete orgPolicies.dataValues.deleted_at
			return successResponse({
				statusCode: httpStatusCode.ok,
				message: 'ORG_POLICIES_SET_SUCCESSFULLY',
				result: { ...orgPolicies.dataValues },
			})
		} catch (error) {
			throw new Error(`Error setting organisation policies: ${error.message}`)
		}
	}

	static async getOrgPolicies(orgId) {
		try {
			const orgPolicies = await OrganisationExtensionQueries.getById(orgId)
			if (orgPolicies) {
				delete orgPolicies.dataValues.deleted_at
				return successResponse({
					statusCode: httpStatusCode.ok,
					message: 'ORG_POLICIES_FETCHED_SUCCESSFULLY',
					result: { ...orgPolicies.dataValues },
				})
			} else {
				throw new Error(`No organisation extension found for org_id ${orgId}`)
			}
		} catch (error) {
			throw new Error(`Error reading organisation policies: ${error.message}`)
		}
	}
}
