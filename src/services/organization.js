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
const { broadcastEvent } = require('@helpers/eventBroadcasterMain')

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
			// This event will deprecated in future
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
			//ends here

			//event Body for org create
			const eventBodyData = organizationDTO.eventBodyDTO({
				entity: 'organization',
				eventType: 'create',
				entityId: createdOrganization.id,
				args: {
					created_by: createdOrganization.created_by,
					name: createdOrganization.name,
					code: createdOrganization.code,
					created_at: createdOrganization?.created_at || new Date(),
					updated_at: createdOrganization?.updated_at || new Date(),
					status: createdOrganization?.status || common.ACTIVE_STATUS,
					meta: createdOrganization?.meta || {},
					deleted: false,
					id: createdOrganization.id,
					description: createdOrganization.description,
					related_orgs: createdOrganization?.related_orgs || [],
					tenant_code: createdOrganization.tenant_code,
				},
			})

			await broadcastEvent('organizationEvents', { requestBody: eventBodyData, isInternal: true })

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

	static async update(id, bodyData, loggedInUserId) {
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
			//org update event emitter
			await orgEventEmitter(orgDetailsBeforeUpdate, orgDetails?.updatedRows?.[0], bodyData)
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
			//Get related orgs with code
			organisationDetails.related_org_details = []
			if (organisationDetails.related_orgs && organisationDetails.related_orgs.length > 0) {
				const options = {
					attributes: ['id', 'code'],
				}
				organisationDetails.related_org_details = await organizationQueries.findAll(
					{ id: { [Op.in]: organisationDetails.related_orgs } },
					options
				)
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
			// fetch organization details before update
			const orgDetailsBeforeUpdate = await organizationQueries.findOne({ id })
			if (!orgDetailsBeforeUpdate) {
				return responses.failureResponse({
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
					message: 'ORGANIZATION_NOT_FOUND',
				})
			}
			// append related organizations and make sure it is unique
			let newRelatedOrgs = [...new Set([...(orgDetailsBeforeUpdate?.related_orgs ?? []), ...relatedOrgs])]

			// check if there are any addition to related_org
			if (!_.isEqual(orgDetailsBeforeUpdate?.related_orgs, newRelatedOrgs)) {
				// update org related orgs
				const addOrUpdateRelatedOrg = await organizationQueries.update(
					{
						id,
					},
					{
						related_orgs: newRelatedOrgs,
					},
					{
						returning: true,
						raw: true,
					}
				)
				// update related orgs to append org Id
				await organizationQueries.appendRelatedOrg(id, newRelatedOrgs, {
					returning: true,
					raw: true,
				})
				const deltaOrgs = _.difference(newRelatedOrgs, orgDetailsBeforeUpdate?.related_orgs)

				eventBroadcaster('updateRelatedOrgs', {
					requestBody: {
						delta_organization_ids: deltaOrgs,
						organization_id: id,
						action: 'PUSH',
						tenant_code: tenantCode
					},
				})

				await orgEventEmitter(orgDetailsBeforeUpdate, addOrUpdateRelatedOrg?.updatedRows?.[0], {
					related_orgs: relatedOrgs,
				})
			}

			//event type will be update

			return responses.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'ORGANIZATION_UPDATED_SUCCESSFULLY',
			})
		} catch (error) {
			throw error
		}
	}
	static async removeRelatedOrg(id, relatedOrgs = [], tenantCode) {
		try {
			// fetch organization details before update
			const orgDetailsBeforeUpdate = await organizationQueries.findOne({ id })
			if (!orgDetailsBeforeUpdate) {
				return responses.failureResponse({
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
					message: 'ORGANIZATION_NOT_FOUND',
				})
			}
			if (orgDetailsBeforeUpdate?.related_orgs == null) {
				return responses.failureResponse({
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
					message: 'RELATED_ORG_REMOVAL_FAILED',
				})
			}
			const relatedOrganizations = _.difference(orgDetailsBeforeUpdate?.related_orgs, relatedOrgs)

			// check if the given org ids are present in the organization's related org
			const relatedOrgMismatchFlag = relatedOrgs.some(
				(orgId) => !orgDetailsBeforeUpdate?.related_orgs.includes(orgId)
			)

			if (relatedOrgMismatchFlag) {
				return responses.failureResponse({
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
					message: 'RELATED_ORG_REMOVAL_FAILED',
				})
			}

			// check if there are any addition to related_org
			if (!_.isEqual(orgDetailsBeforeUpdate?.related_orgs, relatedOrganizations)) {
				// update org remove related orgs
				const addOrUpdateRelatedOrg = await organizationQueries.update(
					{
						id: parseInt(id, 10),
					},
					{
						related_orgs: relatedOrganizations,
					},
					{
						returning: true,
						raw: true,
					}
				)

				// update related orgs remove orgId
				await organizationQueries.removeRelatedOrg(id, relatedOrgs, {
					returning: true,
					raw: true,
				})

				eventBroadcaster('updateRelatedOrgs', {
					requestBody: {
						delta_organization_ids: relatedOrgs,
						organization_id: id,
						action: 'POP',
						tenant_code:tenantCode
					},
				})

				await orgEventEmitter(orgDetailsBeforeUpdate, addOrUpdateRelatedOrg?.updatedRows?.[0], {
					related_orgs: relatedOrgs,
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

async function orgEventEmitter(orgDetailsBeforeUpdate, updatedOrgDetails, bodyData) {
	// compute changes from provided body keys
	let changes = await utils.extractUpdatedValues(orgDetailsBeforeUpdate, updatedOrgDetails, bodyData)
	let related_org_details
	if (Object.prototype.hasOwnProperty.call(bodyData, 'related_orgs') && updatedOrgDetails?.related_orgs?.length) {
		const options = {
			attributes: ['id', 'code'],
		}
		related_org_details = await organizationQueries.findAll(
			{ id: { [Op.in]: updatedOrgDetails.related_orgs } },
			options
		)
	}
	//event Body for org updates
	const eventBodyData = organizationDTO.eventBodyDTO({
		entity: 'organization',
		eventType: 'update',
		entityId: orgDetailsBeforeUpdate.id,
		changedValues: changes,
		args: {
			created_by: orgDetailsBeforeUpdate.created_by,
			name: orgDetailsBeforeUpdate.name,
			code: orgDetailsBeforeUpdate.code,
			created_at: orgDetailsBeforeUpdate?.created_at || new Date(),
			updated_at: updatedOrgDetails?.updated_at || new Date(),
			status: orgDetailsBeforeUpdate?.status || common.ACTIVE_STATUS,
			meta: orgDetailsBeforeUpdate?.meta || {},
			deleted: false,
			id: orgDetailsBeforeUpdate.id,
			description: orgDetailsBeforeUpdate.description,
			related_orgs: orgDetailsBeforeUpdate?.related_orgs || [],
			tenant_code: orgDetailsBeforeUpdate.tenant_code,
			...(related_org_details ? { related_org_details } : {}),
		},
	})
	broadcastEvent('organizationEvents', { requestBody: eventBodyData, isInternal: true })
}
