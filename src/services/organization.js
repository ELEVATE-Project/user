const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const organizationQueries = require('@database/queries/organization')
const organizationRegCodeQueries = require('@database/queries/OrganizationRegistrationCode')
const utils = require('@generics/utils')
const roleQueries = require('@database/queries/user-role')
const orgRoleReqQueries = require('@database/queries/orgRoleRequest')
const orgDomainQueries = require('@database/queries/orgDomain')
const userInviteQueries = require('@database/queries/orgUserInvite')
const notificationTemplateQueries = require('@database/queries/notificationTemplate')
const kafkaCommunication = require('@generics/kafka-communication')
const { Op } = require('sequelize')
const _ = require('lodash')
const { eventBroadcaster } = require('@helpers/eventBroadcaster')
const { eventBroadcasterMain } = require('@helpers/eventBroadcasterMain')
const UserCredentialQueries = require('@database/queries/userCredential')
const emailEncryption = require('@utils/emailEncryption')
const { eventBodyDTO } = require('@dtos/eventBody')
const organizationDTO = require('@dtos/organizationDTO')
const responses = require('@helpers/responses')
const userOrgQueries = require('@database/queries/userOrganization')
const cacheClient = require('@generics/cacheHelper')

module.exports = class OrganizationsHelper {
	/**
	 * Create Organization.
	 * @method
	 * @name create
	 * @param {Object} bodyData
	 * @returns {JSON} - Organization creation data.
	 */

	static async create(bodyData, loggedInUserId) {
		try {
			const existingOrganization = await organizationQueries.findOne({
				code: bodyData.code,
				tenant_code: bodyData.tenant_code,
			})

			if (existingOrganization) {
				return responses.failureResponse({
					message: 'ORGANIZATION_ALREADY_EXISTS',
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
				})
			}

			bodyData.created_by = loggedInUserId

			const createdOrganization = await organizationQueries.create(bodyData)

			// Add domains if provided.
			if (bodyData.domains?.length) {
				await Promise.all(
					bodyData.domains.map(async (domain) => {
						let domainCreationData = {
							domain: domain,
							organization_id: createdOrganization.id,
							created_by: loggedInUserId,
							updated_by: loggedInUserId,
							tenant_code: bodyData.tenant_code,
						}
						await orgDomainQueries.create(domainCreationData)
					})
				)
			}

			// Send an invitation to the admin if an email is provided.
			if (bodyData.admin_email) {
				const plaintextEmailId = bodyData.admin_email.toLowerCase()
				const encryptedEmailId = emailEncryption.encrypt(plaintextEmailId)
				const role = await roleQueries.findOne(
					{ title: common.ORG_ADMIN_ROLE },
					{
						attributes: ['id'],
					}
				)

				if (!role?.id) {
					return responses.failureResponse({
						message: 'ROLE_NOT_FOUND',
						statusCode: httpStatusCode.not_acceptable,
						responseCode: 'CLIENT_ERROR',
					})
				}

				const inviteeData = {
					email: encryptedEmailId,
					name: common.USER_ROLE,
					organization_id: createdOrganization.id,
					roles: [role.id],
					created_by: loggedInUserId,
				}

				const createdInvite = await userInviteQueries.create(inviteeData)
				const userCred = await UserCredentialQueries.create({
					email: encryptedEmailId,
					organization_id: createdOrganization.id,
					organization_user_invite_id: createdInvite.id,
				})

				if (!userCred?.id) {
					return responses.failureResponse({
						message: userCred,
						statusCode: httpStatusCode.not_acceptable,
						responseCode: 'CLIENT_ERROR',
					})
				}
				//send email invitation
				const templateCode = process.env.ORG_ADMIN_INVITATION_EMAIL_TEMPLATE_CODE
				if (templateCode) {
					const templateData = await notificationTemplateQueries.findOneEmailTemplate(templateCode)

					if (templateData) {
						const payload = {
							type: common.notificationEmailType,
							email: {
								to: plaintextEmailId,
								subject: templateData.subject,
								body: utils.composeEmailBody(templateData.body, {
									name: inviteeData.name,
									role: common.ORG_ADMIN_ROLE,
									orgName: bodyData.name,
									appName: process.env.APP_NAME,
									portalURL: process.env.PORTAL_URL,
								}),
							},
						}

						await kafkaCommunication.pushEmailToKafka(payload)
					}
				}
			}

			const cacheKey = common.redisOrgPrefix + createdOrganization.id.toString()
			await utils.internalDel(cacheKey)

			const eventBody = eventBodyDTO({
				entity: 'organization',
				eventType: 'create',
				entityId: createdOrganization.id,
				args: {
					name: bodyData.name,
					created_by: loggedInUserId,
				},
			})
			eventBroadcasterMain('organizationEvents', { requestBody: eventBody, isInternal: true })
			return responses.successResponse({
				statusCode: httpStatusCode.created,
				message: 'ORGANIZATION_CREATED_SUCCESSFULLY',
				result: createdOrganization,
			})
		} catch (error) {
			console.log(error)
			if (error.name === common.SEQUELIZE_UNIQUE_CONSTRAINT_ERROR) {
				return responses.failureResponse({
					message: 'ORG_UNIQUE_CONSTRAIN_ERROR',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			if (error.message === 'registration_code') {
				return responses.failureResponse({
					message: 'REG_CODE_ERROR',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			throw error
		}
	}

	/**
	 * Update Organization
	 * @method
	 * @name update
	 * @param {Object} bodyData
	 * @returns {JSON} - Update Organization data.
	 */

	static async update(id, bodyData, loggedInUserId, tenantCode) {
		try {
			bodyData.updated_by = loggedInUserId
			if (bodyData.relatedOrgs) {
				delete bodyData.relatedOrgs
			}
			const orgDetailsBeforeUpdate = await organizationQueries.findOne({ id: id })
			if (!orgDetailsBeforeUpdate) {
				return responses.failureResponse({
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
					message: 'ORGANIZATION_NOT_FOUND',
				})
			}
			const orgDetails = await organizationQueries.update({ id: id }, bodyData, { returning: true, raw: true })
			await cacheClient
				.evictNamespace({
					tenantCode,
					orgId: orgDetailsBeforeUpdate.code,
					ns: common.CACHE_CONFIG.namespaces.organization.name,
				})
				.catch((error) => {
					console.error(error)
				})
			await cacheClient
				.evictNamespace({
					tenantCode,
					orgId: orgDetailsBeforeUpdate.code,
					ns: common.CACHE_CONFIG.namespaces.profile.name,
				})
				.catch((error) => {
					console.error(error)
				})
			let domains = []
			if (bodyData.domains?.length) {
				let existingDomains = await orgDomainQueries.findAll({
					domain: {
						[Op.in]: bodyData.domains,
					},
					organization_id: id,
				})

				if (!existingDomains.length > 0) {
					domains = bodyData.domains
				} else {
					const domainVal = _.map(existingDomains, 'domain')
					const nonExistedDomains = _.difference(bodyData.domains, domainVal)
					domains = nonExistedDomains
				}

				await Promise.all(
					domains.map(async (domain) => {
						let domainCreationData = {
							domain: domain,
							organization_id: id,
							created_by: loggedInUserId,
						}
						await orgDomainQueries.create(domainCreationData)
					})
				)
			}

			const cacheKey = common.redisOrgPrefix + id.toString()
			await utils.internalDel(cacheKey)
			// await KafkaProducer.clearInternalCache(cacheKey)
			return responses.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'ORGANIZATION_UPDATED_SUCCESSFULLY',
			})
		} catch (error) {
			if (error.name === common.SEQUELIZE_UNIQUE_CONSTRAINT_ERROR) {
				return responses.failureResponse({
					message: 'ORG_UNIQUE_CONSTRAIN_ERROR',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			throw error
		}
	}

	/**
	 * List Organizations.
	 * @method
	 * @name list
	 * @param {Object} bodyData
	 * @returns {JSON} - Organization data.
	 */

	static async list(params) {
		try {
			const tenantCode = params?.query?.tenant_code || params?.query?.tenantCode || null
			// fetch orgs under tenants
			if (tenantCode) {
				let options = {
					attributes: ['id', 'name', 'code', 'description'],
				}
				let filters = {
					tenant_code: tenantCode,
					status: common.ACTIVE_STATUS,
				}
				// filter by org codes if provided
				const orgCodes = params?.query?.organization_codes || params?.query?.organizationCodes || null
				orgCodes
					? (filters.code = {
							[Op.in]: orgCodes.split(',').map((code) => code.toLowerCase().trim()),
					  })
					: null

				let organizations = await organizationQueries.findAll(filters, options)

				return responses.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'ORGANIZATION_FETCHED_SUCCESSFULLY',
					result: organizations,
				})
			}
			if (params.body && params.body.organizationIds) {
				const organizationIds =
					typeof params.body.organizationIds == 'string' &&
					params.body.organizationIds.startsWith('[') &&
					params.body.organizationIds.endsWith(']')
						? JSON.parse(params.body.organizationIds)
						: params.body.organizationIds
				const orgIdsNotFoundInRedis = []
				const orgDetailsFoundInRedis = []
				for (let i = 0; i < organizationIds.length; i++) {
					let orgDetails =
						(await utils.redisGet(common.redisOrgPrefix + organizationIds[i].toString())) || false

					if (!orgDetails) {
						orgIdsNotFoundInRedis.push(organizationIds[i])
					} else {
						orgDetailsFoundInRedis.push(orgDetails)
					}
				}

				let options = {
					attributes: ['id', 'name', 'code', 'description'],
				}

				let organizations = await organizationQueries.findAll(
					{
						id: orgIdsNotFoundInRedis,
						status: common.ACTIVE_STATUS,
					},
					options
				)

				return responses.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'ORGANIZATION_FETCHED_SUCCESSFULLY',
					result: [...organizations, ...orgDetailsFoundInRedis],
				})
			} else {
				let organizations = await organizationQueries.listOrganizations(
					params.pageNo,
					params.pageSize,
					params.searchText
				)

				return responses.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'ORGANIZATION_FETCHED_SUCCESSFULLY',
					result: organizations,
				})
			}
		} catch (error) {
			throw error
		}
	}

	/**
	 * Request Org Role
	 * @method
	 * @name requestOrgRole
	 * @param {Integer} loggedInUserId
	 * @param {Object} bodyData
	 * @returns {JSON} - Organization creation data.
	 */

	static async requestOrgRole(tokenInformation, bodyData) {
		try {
			const role = await roleQueries.findByPk(bodyData.role)
			if (!role) {
				return responses.failureResponse({
					message: 'ROLE_NOT_FOUND',
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const checkForRoleRequest = await orgRoleReqQueries.findOne(
				{
					requester_id: tokenInformation.id,
					role: bodyData.role,
					organization_id: tokenInformation.organization_id,
					tenant_code: tokenInformation.tenant_code,
				},
				{
					order: [['created_at', 'DESC']],
				}
			)

			if (
				checkForRoleRequest &&
				checkForRoleRequest?.id &&
				checkForRoleRequest.status === common.REQUESTED_STATUS
			) {
				return responses.failureResponse({
					message: 'ROLE_CHANGE_PENDING',
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
				})
			}
			let result
			let isAccepted = false
			if (
				!checkForRoleRequest ||
				(checkForRoleRequest?.id && checkForRoleRequest.status === common.REJECTED_STATUS)
			) {
				result = await createRoleRequest(bodyData, tokenInformation)
			} else {
				if (checkForRoleRequest.status === common.ACCEPTED_STATUS) {
					isAccepted = true
				}
				result = checkForRoleRequest
			}

			return responses.successResponse({
				statusCode: httpStatusCode.created,
				message: isAccepted ? 'ROLE_CHANGE_APPROVED' : 'ROLE_CHANGE_REQUESTED',
				result,
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * Read organisation details
	 * @method
	 * @name read
	 * @param {Integer/String} req 	- organisation id/code
	 * @returns {JSON} 									- Organization creation details.
	 */

	static async read(organisationId, organisationCode, tenantCode = null) {
		try {
			let filter = {}
			// Build filter based on incoming query
			if (organisationId !== '') {
				filter.id = parseInt(organisationId)
			} else {
				filter.code = organisationCode
				if (tenantCode.trim()) filter.tenant_code = tenantCode
			}

			const organisationDetails = await organizationQueries.findOne(filter)
			if (!organisationDetails) {
				return responses.failureResponse({
					message: 'ORGANIZATION_NOT_FOUND',
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
				})
			}

			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'ORGANIZATION_FETCHED_SUCCESSFULLY',
				result: organisationDetails,
			})
		} catch (error) {
			throw error
		}
	}
	/**
	 * Read organisation details
	 * @method
	 * @name details
	 * @param {Integer/String} organisationId 	- organisation id/code
	 * @param {Integer/String} tenantCode 	- tenant code
	 * @returns {JSON} 									- Organization details.
	 */

	static async details(organisationId, userId, tenantCode, isAdmin) {
		try {
			const userOrgs = await userOrgQueries.findAll(
				{
					user_id: userId,
					tenant_code: tenantCode,
				},
				{
					attributes: ['organization_code'],
					organizationAttributes: ['id', 'name'],
				}
			)
			if (userOrgs.length <= 0) {
				return responses.failureResponse({
					message: 'ORGANIZATION_NOT_FOUND',
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const userOrgsIds = userOrgs.map((orgs) => {
				return orgs['organization.id']
			})

			if (!userOrgsIds.includes(parseInt(organisationId))) {
				return responses.failureResponse({
					message: 'ORGANIZATION_NOT_ACCESSIBLE',
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
				})
			}

			let filter = {
				id: parseInt(organisationId),
				tenant_code: tenantCode,
			}

			const organisationDetails = await organizationQueries.findOne(filter, { isAdmin })
			if (!organisationDetails) {
				return responses.failureResponse({
					message: 'ORGANIZATION_NOT_FOUND',
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
				})
			}

			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'ORGANIZATION_FETCHED_SUCCESSFULLY',
				result: organizationDTO.transform(organisationDetails),
			})
		} catch (error) {
			throw error
		}
	}

	static async addRelatedOrg(id, relatedOrgs = [], tenantCode) {
		try {
			// fetch organization details before update (ensures tenant_code checked)
			const orgDetailsBeforeUpdate = await organizationQueries.findOne({ id, tenant_code: tenantCode })
			if (!orgDetailsBeforeUpdate) {
				return responses.failureResponse({
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
					message: 'ORGANIZATION_NOT_FOUND',
				})
			}

			// normalize and remove self if present
			let requestedRelated = Array.isArray(relatedOrgs) ? relatedOrgs.map(Number) : []
			requestedRelated = [...new Set(requestedRelated)].filter((rid) => rid && rid !== Number(id))

			if (requestedRelated.length === 0) {
				return responses.successResponse({
					statusCode: httpStatusCode.accepted,
					message: 'ORGANIZATION_UPDATED_SUCCESSFULLY',
				})
			}

			const relatedOrgRecords = await organizationQueries.findAll(
				{ id: requestedRelated, tenant_code: tenantCode },
				{ raw: true }
			)

			// not found or tenant mismatch (because tenant_code filter applied)
			const foundIds = relatedOrgRecords.map((r) => Number(r.id))
			const notFound = requestedRelated.filter((rid) => !foundIds.includes(Number(rid)))
			if (notFound.length) {
				return responses.failureResponse({
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
					message: `RELATED_ORGANIZATIONS_NOT_FOUND`,
				})
			}

			// append related organizations and make sure unique (local copy)
			let newRelatedOrgs = [...new Set([...(orgDetailsBeforeUpdate?.related_orgs ?? []), ...requestedRelated])]

			// check if there are any addition to related_org
			if (!_.isEqual(orgDetailsBeforeUpdate?.related_orgs, newRelatedOrgs)) {
				// update org related orgs (scoped by tenant)
				const updatedOrg = await organizationQueries.update(
					{
						id,
						tenant_code: tenantCode,
					},
					{
						related_orgs: newRelatedOrgs,
					},
					{
						returning: true,
						raw: true,
					}
				)

				// update related orgs to append org Id. scoped to same tenant
				const updatedRelatedOrgs = await organizationQueries.appendRelatedOrg(id, newRelatedOrgs, tenantCode, {
					returning: true,
					raw: true,
				})

				const deltaOrgs = _.difference(newRelatedOrgs, orgDetailsBeforeUpdate?.related_orgs)

				// build list of orgs with their tenant codes
				const orgsToInvalidateRecords = [...updatedOrg.updatedRows, ...updatedRelatedOrgs.updatedRows].map(
					(r) => ({
						orgId: r.code,
						tenantCode: r.tenant_code,
					})
				)

				const { organization, profile } = common.CACHE_CONFIG.namespaces
				const { evictNamespace } = cacheClient

				const tasks = orgsToInvalidateRecords.flatMap(({ orgId, tenantCode: tCode }) =>
					[organization.name, profile.name].map((ns) => ({
						orgId,
						tenantCode: tCode,
						ns,
						promise: evictNamespace({ tenantCode: tCode, orgId, ns }),
					}))
				)

				const results = await Promise.allSettled(tasks.map((t) => t.promise))

				results.forEach((res, i) => {
					if (res.status === 'rejected') {
						const { orgId, tenantCode, ns } = tasks[i]
						console.error(`invalidate failed for org ${orgId} (tenant ${tenantCode}) ns: ${ns}`, res.reason)
					}
				})

				eventBroadcaster('updateRelatedOrgs', {
					requestBody: {
						delta_organization_ids: deltaOrgs,
						organization_id: id,
						action: 'PUSH',
					},
				})
			}

			return responses.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'ORGANIZATION_UPDATED_SUCCESSFULLY',
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	static async removeRelatedOrg(id, relatedOrgs = [], tenantCode) {
		try {
			// fetch organization details before update
			const orgDetailsBeforeUpdate = await organizationQueries.findOne({ id, tenant_code: tenantCode })
			if (!orgDetailsBeforeUpdate) {
				return responses.failureResponse({
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
					message: 'ORGANIZATION_NOT_FOUND',
				})
			}
			if (
				!Array.isArray(orgDetailsBeforeUpdate.related_orgs) ||
				orgDetailsBeforeUpdate.related_orgs.length === 0
			) {
				return responses.failureResponse({
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
					message: 'RELATED_ORG_REMOVAL_FAILED',
				})
			}

			// ensure the orgs to remove exist in same tenant
			const relatedOrgRecords = await organizationQueries.findAll(
				{ id: relatedOrgs, tenant_code: tenantCode },
				{ raw: true }
			)
			const foundIds = relatedOrgRecords.map((r) => Number(r.id))
			const notFound = relatedOrgs.filter((rid) => !foundIds.includes(Number(rid)))
			if (notFound.length) {
				return responses.failureResponse({
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
					message: `RELATED_ORG_REMOVAL_FAILED_NOT_FOUND_OR_DIFFERENT_TENANT: ${notFound.join(',')}`,
				})
			}

			// recalc related orgs for this org
			const newRelated = _.difference(orgDetailsBeforeUpdate.related_orgs, relatedOrgs)

			if (!_.isEqual(orgDetailsBeforeUpdate.related_orgs, newRelated)) {
				// update this org
				const updatedOrg = await organizationQueries.update(
					{ id, tenant_code: tenantCode },
					{ related_orgs: newRelated },
					{ returning: true, raw: true }
				)

				// update reverse side (other orgs remove this org's id), scoped by tenant
				const updatedRelatedOrgs = await organizationQueries.removeRelatedOrg(id, relatedOrgs, tenantCode, {
					returning: true,
					raw: true,
				})

				// invalidate cache and broadcast event
				const orgsToInvalidateRecords = [...updatedOrg.updatedRows, ...updatedRelatedOrgs.updatedRows].map(
					(r) => ({
						orgId: r.code,
						tenantCode: r.tenant_code,
					})
				)
				const { organization, profile } = common.CACHE_CONFIG.namespaces
				const { evictNamespace } = cacheClient

				const tasks = orgsToInvalidateRecords.flatMap(({ orgId, tenantCode: tCode }) =>
					[organization.name, profile.name].map((ns) => ({
						orgId,
						tenantCode: tCode,
						ns,
						promise: evictNamespace({ tenantCode: tCode, orgId, ns }),
					}))
				)

				const results = await Promise.allSettled(tasks.map((t) => t.promise))
				results.forEach((res, i) => {
					if (res.status === 'rejected') {
						const { orgId, tenantCode, ns } = tasks[i]
						console.error(`invalidate failed for org ${orgId} (tenant ${tenantCode}) ns: ${ns}`, res.reason)
					}
				})

				eventBroadcaster('updateRelatedOrgs', {
					requestBody: {
						delta_organization_ids: relatedOrgs,
						organization_id: id,
						action: 'POP',
					},
				})
			}

			return responses.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'ORGANIZATION_UPDATED_SUCCESSFULLY',
			})
		} catch (error) {
			throw error
		}
	}

	static async addRegCode(code, tenantCode, registrationCodes) {
		try {
			// Fetch organization details before update
			const orgDetailsBeforeUpdate = await verifyOrg(code, tenantCode)

			// Convert existing codes to Set for O(1) lookup
			const existingRegCodes = new Set(orgDetailsBeforeUpdate?.registration_codes || [])

			// Process registration codes in a single pass
			const invalidCodes = []
			const validCodes = []

			for (const code of registrationCodes) {
				const trimmedCode = code.toString().trim().toLowerCase()
				if (existingRegCodes.has(trimmedCode)) {
					invalidCodes.push(trimmedCode)
				} else {
					validCodes.push(trimmedCode)
				}
			}

			if (invalidCodes.length > 0) {
				return responses.failureResponse({
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
					message: {
						key: 'INVALID_REG_CODE_ERROR',
						interpolation: { errorValues: invalidCodes, errorMessage: 'already added' },
					},
				})
			}

			// Create unique codes to append using Set for deduplication
			const codeToAppend = [...new Set(validCodes)]

			if (codeToAppend.length > 0) {
				const registrationCodeBody = codeToAppend.map((registration_code) => ({
					registration_code,
					organization_code: orgDetailsBeforeUpdate.code,
					status: common.ACTIVE_STATUS,
					tenant_code: orgDetailsBeforeUpdate?.tenant_code,
					created_by: orgDetailsBeforeUpdate?.created_by || null,
					deleted_at: null,
				}))

				await organizationRegCodeQueries.bulkCreate(registrationCodeBody)
			}

			return responses.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'ORGANIZATION_UPDATED_SUCCESSFULLY',
			})
		} catch (error) {
			// Handle unique constraint error
			if (
				error.name === common.SEQUELIZE_UNIQUE_CONSTRAINT_ERROR ||
				error.code === common.SEQUELIZE_UNIQUE_CONSTRAINT_ERROR_CODE
			) {
				return responses.failureResponse({
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
					message: {
						key: 'UNIQUE_CONSTRAINT_ERROR',
						interpolation: { fields: `Registration code : '${error?.fields?.registration_code}'` },
					},
				})
			}
			throw error
		}
	}
	static async removeRegCode(id, tenantCode, registrationCodes) {
		try {
			// Fetch organization details before update
			const orgDetailsBeforeUpdate = await verifyOrg(id, tenantCode)

			// Convert existing codes to Set for O(1) lookup
			const existingRegCodesSet = new Set(
				orgDetailsBeforeUpdate?.registration_codes?.map((code) => code?.toString().toLowerCase().trim()) || []
			)

			// Process codes in a single pass
			const validCodes = []
			const invalidCodes = []
			const uniqueCodes = new Set(
				registrationCodes.map((code) => code?.toString().toLowerCase().trim()).filter((code) => code != null)
			)

			for (const code of uniqueCodes) {
				if (existingRegCodesSet.has(code)) {
					validCodes.push(code)
				} else {
					invalidCodes.push(code)
				}
			}

			if (invalidCodes.length > 0) {
				return responses.failureResponse({
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
					message: {
						key: 'INVALID_REG_CODE_ERROR',
						interpolation: { errorValues: invalidCodes, errorMessage: 'not added' },
					},
				})
			}

			if (validCodes.length > 0) {
				await organizationRegCodeQueries.bulkDelete(
					validCodes,
					orgDetailsBeforeUpdate?.code,
					orgDetailsBeforeUpdate?.tenant_code
				)
			}

			return responses.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'ORGANIZATION_UPDATED_SUCCESSFULLY',
			})
		} catch (error) {
			throw error
		}
	}
}

async function verifyOrg(code, tenantCode) {
	// fetch organization details before update
	const orgDetailsBeforeUpdate = await organizationQueries.findOne(
		{ code, tenant_code: tenantCode },
		{ isAdmin: true }
	)
	if (!orgDetailsBeforeUpdate || Object.keys(orgDetailsBeforeUpdate).length <= 0) {
		throw responses.failureResponse({
			statusCode: httpStatusCode.not_acceptable,
			responseCode: 'CLIENT_ERROR',
			message: 'ORGANIZATION_NOT_FOUND',
		})
	}
	return orgDetailsBeforeUpdate
}

async function createRoleRequest(bodyData, tokenInformation) {
	const roleRequestData = {
		requester_id: tokenInformation.id,
		role: bodyData.role,
		organization_id: tokenInformation.organization_id,
		tenant_code: tokenInformation.tenant_code,
		meta: bodyData.form_data,
	}

	const result = await orgRoleReqQueries.create(roleRequestData)
	return result
}
