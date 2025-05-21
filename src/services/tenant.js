/**
 * name : tenant.js
 * author : Adithya Dinesh
 * created-date : 07-May-2025
 * Description : Tenant helper.
 */

// Dependencies
const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const tenantQueries = require('@database/queries/tenants')
const tenantDomainQueries = require('@database/queries/tenantDomain')
const organisationService = require('@services/organization')
const entityTypeQueries = require('@database/queries/entityType')
const entityTypeService = require('@services/entityType')
const EntityHelper = require('@services/entities')
const EntityQueries = require('@database/queries/entities')
const formsQueries = require('@database/queries/form')
const formService = require('@services/form')
const notificationTemplateQueries = require('@database/queries/notificationTemplate')
const notificationTemplateService = require('@services/notification')
const RollbackStack = require('@generics/RollbackStack')
const organisationQueries = require('@database/queries/organization')
const userRolesQueries = require('@database/queries/user-role')
const userRolesService = require('@services/user-role')
const orgAdminService = require('@services/org-admin')
const organizationFetureService = require('@services/organization-feature')
const organizationFeatureQueries = require('@database/queries/organization-feature')
const utils = require('@generics/utils')
const _ = require('lodash')
const responses = require('@helpers/responses')
const { Op } = require('sequelize')

module.exports = class tenantHelper {
	/**
	 * Create Tenant
	 * @method
	 * @name create
	 * @param {Object} bodyData - it contains tenant infomration
	 * @param {string} userId - Logged in User Id
	 * @returns {JSON} - Create tenant response
	 */
	static async create(bodyData, userId, domains) {
		const rollbackStack = new RollbackStack()
		try {
			// make sure domains is a string
			domains = Array.isArray(domains) ? domains : domains.split(',')

			// pick relevant data from body data for tenant creation
			const tenantCreateBody = {
				..._.pick(bodyData, ['name', 'code', 'description', 'logo', 'theming', 'meta']),
				status: common.ACTIVE_STATUS,
				created_by: userId,
				updated_by: userId,
			}
			let tenantCreateResponse = {}
			try {
				tenantCreateResponse = await tenantQueries.create(tenantCreateBody)
			} catch (error) {
				// Check for unique constraint violation (duplicate code)
				if (
					error.code === '23505' ||
					error.message.includes('unique constraint') ||
					error.message.includes('duplicate key')
				) {
					return responses.failureResponse({
						statusCode: httpStatusCode.bad_request,
						message: 'TENANT_ALREADY_EXISTS',
						result: {},
					})
				}
				console.log(error)
				throw error // Re-throw other errors
			}

			// push function to rollback tenant creation into stack
			rollbackStack.push(async () => {
				await tenantQueries.hardDelete(tenantCreateResponse.code)
			})

			// once the tenant is created , create body data for domain creation
			const tenantDomainBody = domains.map((domain) => {
				domain = utils.parseDomain(domain)
				return {
					tenant_code: tenantCreateResponse.code,
					domain: domain.trim(),
					verified: true,
				}
			})

			try {
				// create promise for tenant domain promises
				const tenantDomainCreatePromises = tenantDomainBody.map((doms) => {
					return tenantDomainQueries.create(doms)
				})

				// execute tenant domain create promise
				const domainCreationResponse = await Promise.all(tenantDomainCreatePromises)

				// check if all promises are executed successfully else rollback and return error
				for (let response of domainCreationResponse) {
					if (response?.id) {
						rollbackStack.push(async () => {
							await tenantDomainQueries.hardDelete(response.id)
						})
					} else {
						if (rollbackStack.size() > 0) await rollbackStack.execute()

						return responses.failureResponse({
							statusCode: httpStatusCode.bad_request,
							message: 'TENANT_DOMAIN_ALREADY_EXISTS',
							result: {},
						})
					}
				}
			} catch (error) {
				// rollback in case of any error
				if (rollbackStack.size() > 0) await rollbackStack.execute()

				return responses.failureResponse({
					statusCode: httpStatusCode.bad_request,
					message: 'TENANT_DOMAIN_ALREADY_EXISTS',
					result: {},
				})
			}

			try {
				// default org create body
				const defaultOrgCreateBody = {
					name: process.env.DEFAULT_TENANT_ORG_NAME,
					code: process.env.DEFAULT_TENANT_ORG_CODE,
					tenant_code: tenantCreateResponse.code,
					description: '',
					domains: [],
				}
				// default org creation using org service function
				const defaultOrgCreateResponse = await organisationService.create(defaultOrgCreateBody, userId)
				// rollback and throw error in case org creation failed
				if (!defaultOrgCreateResponse.result.id) {
					if (rollbackStack.size() > 0) await rollbackStack.execute()
					throw new Error('Default Org creation Failed')
				}

				const defaultOrgId = defaultOrgCreateResponse.result.id
				// add rollback code for org
				rollbackStack.push(async () => {
					await organisationQueries.hardDelete(defaultOrgId)
				})

				// ******* adding default entities and entity types to Default Org CODE BEGINS HERE *******
				let allDefaultEntityTypeValues = await entityTypeQueries.findAllEntityTypes(
					process.env.DEFAULT_ORG_ID,
					['value']
				)
				allDefaultEntityTypeValues = allDefaultEntityTypeValues.map((entityType) => entityType.value)
				if (allDefaultEntityTypeValues.length > 0) {
					const entityTypeResponse = await entityTypeService.readUserEntityTypes(
						{
							value: allDefaultEntityTypeValues,
						},
						userId,
						process.env.DEFAULT_ORG_ID,
						process.env.DEFAULT_TENANT_CODE
					)

					const entitiyTypeAndEntities = entityTypeResponse?.result?.entity_types || []
					if (entitiyTypeAndEntities.length > 0) {
						let entityEntityTypeMapping = {}
						const entityTypeCreationPormises = entitiyTypeAndEntities.map((entityType) => {
							entityEntityTypeMapping[entityType.value] = entityType?.has_entities
								? entityType.entities
								: []
							return entityTypeService.create(
								{
									value: entityType.value,
									label: entityType.label,
									status: common.ACTIVE_STATUS,
									tenant_code: tenantCreateResponse.code,
									type: 'SYSTEM',
									allow_filtering: entityType.allow_filtering,
									data_type: entityType.data_type,
									has_entities: entityType?.has_entities,
									required: entityType?.required || false,
									regex: entityType?.regex || null,
									meta: entityType?.meta || {},
									external_entity_type: entityType?.external_entity_type || false,
								},
								userId,
								defaultOrgId
							)
						})

						let entityTypeCreationPormisesResponse = await Promise.all(entityTypeCreationPormises)

						const entitiesToCreate = entityTypeCreationPormisesResponse.map((response) => {
							rollbackStack.push(async () => {
								await entityTypeQueries.hardDelete(response.result.id)
							})
							return {
								...entityEntityTypeMapping[response.result.value].map((entities) => {
									return {
										value: entities.value,
										label: entities.label,
										status: common.ACTIVE_STATUS,
										type: entities.type,
										entity_type_id: response.result.id,
									}
								}),
							}
						})

						// Step 1: Remove empty objects and flatten nested objects
						const filteredEntities = entitiesToCreate
							.filter((entities) => Object.keys(entities).length > 0) // Remove empty objects
							.flatMap((entities) => Object.values(entities)) // Flatten nested objects into an array

						// Step 2: Create promises for each entity
						const entitiesCreationPromise = filteredEntities.map((entity) => {
							return EntityHelper.create(entity, userId)
						})

						const createdEntities = await Promise.all(entitiesCreationPromise)

						createdEntities.map((entities) => {
							rollbackStack.push(async () => {
								await EntityQueries.hardDelete(entities.result.id)
							})
						})
					}
				}
				// ******* adding default entities and entity types to Default Org CODE ENDS HERE *******

				// ******* adding default Forms to Default Org CODE BEGINS HERE *******

				const fetchAllDefaultForms = await formsQueries.findAll({
					organization_id: process.env.DEFAULT_ORG_ID,
				})

				if (fetchAllDefaultForms.length > 0) {
					const formCreationPromise = fetchAllDefaultForms.map((forms) => {
						return formService.create(
							{
								type: forms.type,
								sub_type: forms.sub_type,
								data: forms.data,
							},
							defaultOrgId,
							tenantCreateResponse.code
						)
					})
					const formCreateResponse = await Promise.all(formCreationPromise)
					formCreateResponse.map((form) => {
						rollbackStack.push(async () => {
							await formsQueries.hardDelete(form.result.id)
						})
					})
				}
				// ******* adding default Forms to Default Org CODE ENDS HERE *******

				// ******* adding default Notification Template to Default Org CODE BEGINS HERE *******

				const fetchAllDefaultNotificatin = await notificationTemplateQueries.findAllNotificationTemplates({
					organization_id: process.env.DEFAULT_ORG_ID,
				})

				if (fetchAllDefaultNotificatin.length > 0) {
					const notificationCreationPromise = fetchAllDefaultNotificatin.map((notification) => {
						return notificationTemplateService.create(
							{
								type: notification.type,
								code: notification.code,
								subject: notification.subject,
								body: notification.body,
								email_header: notification.email_header,
								email_footer: notification.email_footer,
							},
							{
								organization_id: defaultOrgId,
								tenant_code: tenantCreateResponse.code,
								id: userId,
							}
						)
					})
					const notificationCreateResponse = await Promise.all(notificationCreationPromise)
					notificationCreateResponse.map((notification) => {
						rollbackStack.push(async () => {
							await notificationTemplateQueries.hardDelete(notification.result.id)
						})
					})
				}

				// ******* adding default Notification Template to Default Org CODE ENDS HERE *******

				// ******* adding default org features under new tenant STARTS HERE *******

				// fetch default org features

				const fetchAllDefaultOrgFeatures = await organizationFeatureQueries.findAllOrganizationFeature({
					organization_code: process.env.DEFAULT_TENANT_ORG_CODE,
					tenant_code: process.env.DEFAULT_TENANT_CODE,
				})

				if (fetchAllDefaultOrgFeatures.length > 0) {
					const orgFeatureCreationPromise = fetchAllDefaultOrgFeatures.map((feature) => {
						return organizationFetureService.create(
							{
								feature_code: feature.feature_code,
								enabled: feature.enabled,
								feature_name: feature.feature_name,
								icon: feature.icon,
								redirect_code: feature.redirect_code,
								translation: feature.translation,
								meta: feature.meta,
							},
							{
								organization_id: defaultOrgId,
								organization_code: process.env.DEFAULT_TENANT_ORG_CODE,
								tenant_code: tenantCreateResponse.code,
								id: userId,
							}
						)
					})
					const orgFeatureCreateResponse = await Promise.all(orgFeatureCreationPromise)

					orgFeatureCreateResponse.map((feature) => {
						rollbackStack.push(async () => {
							await organizationFeatureQueries.hardDelete(
								feature.result.feature_code,
								feature.result.organization_code,
								eature.result.tenant_code
							)
						})
					})
				}

				// ******* adding default org features under new tenant ENDS HERE *******

				// ******* adding default user roles to Default Org CODE BEGINS HERE *******
				const fetchAllDefaultUserRoles = await userRolesQueries.findAll({
					organization_id: process.env.DEFAULT_ORG_ID,
				})

				if (fetchAllDefaultUserRoles.length > 0) {
					const roleCreationPromises = fetchAllDefaultUserRoles.map((userRole) => {
						return userRolesService.create(
							{
								title: userRole.title,
								label: userRole.label || userRole.title,
								user_type: userRole.user_type,
								status: userRole.status,
								visibility: userRole.visibility,
								tenant_code: tenantCreateResponse.code,
							},
							defaultOrgId
						)
					})

					const roleCreationPromiseResponse = await Promise.all(roleCreationPromises)
					roleCreationPromiseResponse.map((role) => {
						rollbackStack.push(async () => {
							await userRolesQueries.hardDelete(role.result.id)
						})
					})
				}
				// ******* adding default user roles to Default Org CODE ENDS HERE *******
			} catch (error) {
				if (rollbackStack.size() > 0) await rollbackStack.execute()
				return responses.failureResponse({
					statusCode: httpStatusCode.bad_request,
					message: 'DEFAULT_ORG_CREATION_FAILED',
					result: {},
				})
			}

			return responses.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'TENANT_CREATED_SUCCESSFULLY',
				result: tenantCreateResponse,
			})
		} catch (error) {
			if (rollbackStack.size() > 0) await rollbackStack.execute()
			console.log(error)
			throw error // Re-throw other errors
		}
	}

	/**
	 * Update Tenant
	 * @method
	 * @name update
	 * @param {string} tenantCode - code of the tenant
	 * @param {Object} bodyData - it contains tenant infomration to update
	 * @param {string} userId - Logged in User Id
	 * @returns {JSON} - Update tenant response
	 */
	static async update(tenantCode, bodyData, userId) {
		try {
			// fetch tenant details
			const tenantDetails = await tenantQueries.findOne({
				code: tenantCode,
			})

			if (!tenantDetails?.code) {
				return responses.failureResponse({
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
					message: 'TENANT_NOT_FOUND',
				})
			}
			// list of updatable keys for a tenant
			const tenantUpdatableKeys = ['name', 'description', 'logo', 'theming', 'meta']
			// pick relevant data from body data for tenant updation
			bodyData = _.pick(bodyData, tenantUpdatableKeys)

			let tenantUpdateBody = {}
			// prepare the update body based on comparing with the current data to make sure the change
			for (let key of tenantUpdatableKeys) {
				if (!_.isEqual(bodyData[key], tenantDetails[key])) {
					tenantUpdateBody[key] = bodyData[key]
				}
			}
			// update only if the data is changed
			if (Object.keys(tenantUpdateBody).length > 0) {
				tenantUpdateBody.updated_by = userId
				await tenantQueries.update(
					{
						code: tenantCode,
					},
					tenantUpdateBody
				)
			}

			return responses.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'TENANT_UPDATED_SUCCESSFULLY',
				result: bodyData,
			})
		} catch (error) {
			console.log(error)
			throw error // Re-throw other errors
		}
	}

	/**
	 * add Tenant domains
	 * @method
	 * @name addDomain
	 * @param {string} tenantCode - code of the tenant
	 * @param {Object} domains - list of domains
	 * @returns {JSON} - add tenant domain response
	 */
	static async addDomain(tenantCode, domains) {
		try {
			// fetch tenant details
			const tenantDetails = await tenantQueries.findOne({
				code: tenantCode,
			})

			if (!tenantDetails?.code) {
				return responses.failureResponse({
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
					message: 'TENANT_NOT_FOUND',
				})
			}
			domains = Array.isArray(domains) ? domains : domains.split(',')
			domains = domains
				.filter((dom) => typeof dom === 'string' && dom !== '')
				.map((doms) => {
					return utils.parseDomain(doms)
				})

			if (domains.length <= 0) {
				return responses.successResponse({
					statusCode: httpStatusCode.accepted,
					message: 'INVALID_TENANT_DOMAINS',
					result: {},
				})
			}
			let existingDomains = await tenantDomainQueries.findAll(
				{
					tenant_code: tenantCode,
				},
				{
					attributes: ['domain'],
				}
			)

			if (existingDomains.length > 0) {
				existingDomains = existingDomains.map((tenantDomain) => tenantDomain.domain)
			} else {
				existingDomains = []
			}

			const domainsToCreate = _.difference(domains, existingDomains)

			if (domainsToCreate.length > 0) {
				const domainCreationPromise = domainsToCreate.map((doms) => {
					return tenantDomainQueries.create({
						tenant_code: tenantCode,
						domain: doms,
						verified: true,
					})
				})
				await Promise.all(domainCreationPromise)
			} else {
				return responses.successResponse({
					statusCode: httpStatusCode.accepted,
					message: 'TENANT_DOMAINS_ALREADY_PRESENT',
					result: {},
				})
			}

			return responses.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'TENANT_DOMAINS_ADDED_SUCCESSFULLY',
				result: {
					new_domains_added: domainsToCreate,
				},
			})
		} catch (error) {
			console.log(error)
			throw error // Re-throw other errors
		}
	}

	/**
	 * remove Tenant domains
	 * @method
	 * @name addDomain
	 * @param {string} tenantCode - code of the tenant
	 * @param {Object} domains - list of domains
	 * @returns {JSON} - add tenant domain response
	 */
	static async removeDomain(tenantCode, domains) {
		try {
			// fetch tenant details
			const tenantDetails = await tenantQueries.findOne({
				code: tenantCode,
			})

			if (!tenantDetails?.code) {
				return responses.failureResponse({
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
					message: 'TENANT_NOT_FOUND',
				})
			}
			// make sure the domains is in array format
			domains = Array.isArray(domains) ? domains : domains.split(',')
			// parse domains and filter out empty values from array
			domains = domains
				.filter((dom) => typeof dom === 'string' && dom !== '')
				.map((doms) => {
					return utils.parseDomain(doms)
				})

			if (domains.length <= 0) {
				return responses.successResponse({
					statusCode: httpStatusCode.accepted,
					message: 'INVALID_TENANT_DOMAINS',
					result: {},
				})
			}

			// fetch existing domains for the tenant
			let existingDomains = await tenantDomainQueries.findAll(
				{
					tenant_code: tenantCode,
				},
				{
					attributes: ['domain', 'id'],
				}
			)

			let domainIdMapping

			if (existingDomains.length > 0) {
				// create domain code id mapping
				domainIdMapping = existingDomains.reduce((mapping, eachTenantDomain) => {
					mapping[eachTenantDomain.domain] = eachTenantDomain.id
					return mapping
				}, {})
				// make an array of existing domains
				existingDomains = existingDomains.map((tenantDomain) => tenantDomain.domain)
			} else {
				existingDomains = []
			}

			// prepare domains to remove
			const domainsToRemove = domains
				.map((doms) => {
					if (existingDomains.includes(doms)) {
						return doms
					} else {
						return false
					}
				})
				.filter((doms) => doms !== false)

			// if no given domains matches with the existing domains return
			if (domainsToRemove.length == 0) {
				return responses.failureResponse({
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
					message: 'NO_MATCHING_TENANT_DOMAINS_TO_REMOVE',
				})
			}
			// make sure user is not removing all the domains from the existing domain
			if (
				domainsToRemove.length == existingDomains.length &&
				_.isEqual(_.sortBy(domainsToRemove, String), _.sortBy(existingDomains, String))
			) {
				return responses.failureResponse({
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
					message: 'TENANT_DOMAINS_ATLEAST_ONE_MANDATORY',
				})
			}

			const domainRemovePromise = domainsToRemove.map((domainRemove) => {
				return tenantDomainQueries.hardDelete(domainIdMapping[domainRemove])
			})

			await Promise.all(domainRemovePromise)

			return responses.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'TENANT_DOMAINS_ADDED_SUCCESSFULLY',
				result: {
					removed_domains: domainsToRemove,
				},
			})
		} catch (error) {
			console.log(error)
			throw error // Re-throw other errors
		}
	}

	/**
	 * read Tenant details
	 * @method
	 * @name read
	 * @param {string} tenantCode - code of the tenant
	 * @returns {JSON} - Tenant details
	 */
	static async read(tenantCode) {
		try {
			// fetch tenant details
			let tenantDetails = await tenantQueries.findOne(
				{
					code: tenantCode,
				},
				{ organizationAttributes: ['id', 'name', 'code'] }
			)

			if (!tenantDetails?.code) {
				return responses.failureResponse({
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
					message: 'TENANT_NOT_FOUND',
				})
			}

			const domains = await tenantDomainQueries.findAll(
				{
					tenant_code: tenantCode,
				},
				{
					attributes: ['domain', 'verified'],
				}
			)

			delete tenantDetails.deleted_at
			tenantDetails.dataValues.domains = domains || []

			return responses.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'TENANT_DETAILS_FETCHED',
				result: tenantDetails,
			})
		} catch (error) {
			console.log(error)
			throw error // Re-throw other errors
		}
	}
	/**
	 * get Tenant list
	 * @method
	 * @name read
	 * @returns {JSON} - Tenant list
	 */
	static async list(pageNo, pageSize, search = false) {
		try {
			let result = []
			let filter = {}
			if (pageSize) filter.limit = pageSize
			if (pageNo) filter.offset = pageSize * (pageNo - 1)

			if (search) {
				filter[Op.or] = [{ code: { [Op.iLike]: `%${search}%` } }, { name: { [Op.iLike]: `%${search}%` } }]
			}

			// fetch tenant details
			const tenantDetails = await tenantQueries.findAll(filter)
			result = tenantDetails.map((tenant) => {
				return {
					code: tenant.code,
					name: tenant.name,
					description: tenant.description,
				}
			})

			return responses.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'TENANT_LIST_FETCHED',
				result: result,
			})
		} catch (error) {
			console.log(error)
			throw error // Re-throw other errors
		}
	}

	static async userBulkUpload(filePath, userId, orgCode, tenantCode) {
		try {
			let orgFilter = {
				tenant_code: tenantCode,
			}
			if (isNaN(orgCode)) {
				orgFilter.code = orgCode
			} else {
				orgFilter.id = orgCode
			}
			const orgDetails = await organisationQueries.findOne(orgFilter, {
				attributes: ['id', 'tenant_code'],
			})

			if (!orgDetails?.id) {
				return responses.failureResponse({
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
					message: 'ORGANIZATION_NOT_FOUND',
				})
			}

			if (orgDetails?.tenant_code != tenantCode) {
				return responses.failureResponse({
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
					message: 'INVALID_ORG_TENANT_MAPPING',
				})
			}

			const tokenInformation = {
				id: userId,
				organization_id: orgDetails.id,
				tenant_code: tenantCode,
			}

			const bulkUpload = await orgAdminService.bulkCreate(filePath, tokenInformation)

			return bulkUpload
		} catch (error) {
			console.log(error)
			throw error // Re-throw other errors
		}
	}
}
