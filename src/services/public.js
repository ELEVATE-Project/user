const tenantDomainQueries = require('@database/queries/tenantDomain')
const tenantQueries = require('@database/queries/tenants')
const organizationQueries = require('@database/queries/organization')
const userQueries = require('@database/queries/users')
const organizationUserInviteQueries = require('@database/queries/orgUserInvite')
const responses = require('@helpers/responses')
const httpStatusCode = require('@generics/http-status')
const entityTypeQueries = require('@database/queries/entityType')
const tenantTransformDTO = require('@dtos/tenantDTO') // Path to your DTO file
const utils = require('@generics/utils')
const { Op } = require('sequelize')
const UserTransformDTO = require('@dtos/userDTO')
const emailEncryption = require('@utils/emailEncryption')
const common = require('@constants/common')

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
	static async userInvites(invitationKey, domain) {
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

			const userInvite = await organizationUserInviteQueries.findOne(
				{
					invitation_key: invitationKey,
					tenant_code: tenantDetail.code,
					status: common.INVITED_STATUS,
				},
				{
					isValid: true,
				}
			)

			if (!userInvite?.id || !userInvite['invitation.id']) {
				return notFoundResponse('INVALID_INVITATION')
			}

			const modelName = await userQueries.getModelName()
			// Fetch default organization and validation data
			const defaultOrg = await organizationQueries.findOne(
				{ code: process.env.DEFAULT_ORGANISATION_CODE, tenant_code: tenantDetail.code },
				{ attributes: ['id'] }
			)
			const validationData = await entityTypeQueries.findUserEntityTypesAndEntities({
				status: 'ACTIVE',
				organization_id: {
					[Op.in]: [userInvite.organization_id, defaultOrg.id],
				},
				tenant_code: tenantDetail.code,
				model_names: { [Op.contains]: [modelName] },
			})
			const prunedEntities = utils.removeDefaultOrgEntityTypes(validationData, userInvite.organization_id)
			const processedDbResponse = await utils.processDbResponse(userInvite, prunedEntities)
			let response = UserTransformDTO.userInviteDTO(processedDbResponse, prunedEntities)
			response.email = response?.email ? emailEncryption.decrypt(response?.email) : response?.email
			response.phone = response?.phone ? emailEncryption.decrypt(response.phone) : response.phone
			response.editable_fields =
				userInvite['invitation.editable_fields'].filter(
					(field) => field !== '' && field !== null && field !== undefined
				) || []
			delete response.organizations
			delete response.id

			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'USER_DATA_FETCHED',
				result: response,
			})
		} catch (error) {
			console.error(error)
			throw error
		}
	}
}
