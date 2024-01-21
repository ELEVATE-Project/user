const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const organizationQueries = require('@database/queries/organization')
const utils = require('@generics/utils')
const roleQueries = require('@database/queries/userRole')
const orgRoleReqQueries = require('@database/queries/orgRoleRequest')
const orgDomainQueries = require('@database/queries/orgDomain')
const userInviteQueries = require('@database/queries/orgUserInvite')
const notificationTemplateQueries = require('@database/queries/notificationTemplate')
const kafkaCommunication = require('@generics/kafka-communication')
const { Op } = require('sequelize')
const _ = require('lodash')
const { eventBroadcaster } = require('@helpers/eventBroadcaster')
const UserCredentialQueries = require('@database/queries/userCredential')
const emailEncryption = require('@utils/emailEncryption')

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
			const existingOrganization = await organizationQueries.findOne({ code: bodyData.code })

			if (existingOrganization) {
				return common.failureResponse({
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
					return common.failureResponse({
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
					return common.failureResponse({
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

			eventBroadcaster('createOrganizationExtension', {
				queryParams: {
					creatorId: loggedInUserId,
					organizationId: createdOrganization.id,
				},
			})
			return common.successResponse({
				statusCode: httpStatusCode.created,
				message: 'ORGANIZATION_CREATED_SUCCESSFULLY',
				result: createdOrganization,
			})
		} catch (error) {
			console.log(error)
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
			const orgDetailsBeforeUpdate = await organizationQueries.findOne({ id: id })
			if (!orgDetailsBeforeUpdate) {
				return common.failureResponse({
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
					message: 'ORGANIZATION_NOT_FOUND',
				})
			}
			const orgDetails = await organizationQueries.update({ id: id }, bodyData, { returning: true, raw: true })

			if (!_.isEqual(orgDetailsBeforeUpdate?.related_orgs, bodyData?.related_orgs)) {
				if (
					bodyData?.related_orgs &&
					_.isEqual(orgDetails.updatedRows[0].related_orgs, bodyData.related_orgs)
				) {
					await organizationQueries.appendRelatedOrg(orgDetails.updatedRows[0].id, bodyData.related_orgs, {
						returning: true,
						raw: true,
					})
				}
				const removedOrgIds = _.difference(
					orgDetailsBeforeUpdate.related_orgs,
					orgDetails.updatedRows[0].related_orgs
				)
				await organizationQueries.removeRelatedOrg(orgDetails.updatedRows[0].id, removedOrgIds, {
					returning: true,
					raw: true,
				})

				eventBroadcaster('updateRelatedOrgs', {
					requestBody: {
						related_organization_ids: orgDetails.updatedRows[0].related_orgs,
						organization_id: orgDetails.updatedRows[0].id,
					},
				})
			}

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
			return common.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'ORGANIZATION_UPDATED_SUCCESSFULLY',
			})
		} catch (error) {
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
			if (params.body && params.body.organizationIds) {
				const organizationIds = params.body.organizationIds
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

				return common.successResponse({
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

				return common.successResponse({
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
				return common.failureResponse({
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
				},
				{
					order: [['created_at', 'DESC']],
				}
			)

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

			return common.successResponse({
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

	static async read(organisationId, organisationCode) {
		try {
			let filter = {}
			// Build filter based on incoming query
			if (organisationId !== '') {
				filter.id = parseInt(organisationId)
			} else {
				filter.code = organisationCode
			}

			const organisationDetails = await organizationQueries.findOne(filter)
			if (!organisationDetails) {
				return common.failureResponse({
					message: 'ORGANIZATION_NOT_FOUND',
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
				})
			}

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'ORGANIZATION_FETCHED_SUCCESSFULLY',
				result: organisationDetails,
			})
		} catch (error) {
			throw error
		}
	}
}

async function createRoleRequest(bodyData, tokenInformation) {
	const roleRequestData = {
		requester_id: tokenInformation.id,
		role: bodyData.role,
		organization_id: tokenInformation.organization_id,
		meta: bodyData.form_data,
	}

	const result = await orgRoleReqQueries.create(roleRequestData)
	return result
}
