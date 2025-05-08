/**
 * name : tenant.js
 * author : Adithya Dinesh
 * created-date : 07-May-2025
 * Description : Tenant helper.
 */

// Dependencies
const httpStatusCode = require('@generics/http-status')
const db = require('@database/models/index')
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
const RollbackStack = require('@generics/rollBackStack')
const organisationQueries = require('@database/queries/organization')
const utils = require('@generics/utils')
const _ = require('lodash')
const responses = require('@helpers/responses')

module.exports = class tenantHelper {
	/**
	 * Create Tenant
	 * @method
	 * @name create
	 * @param {Object} bodyData - it contains user infomration
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
				const tenantDomainCreatePromises = tenantDomainBody.map((doms) => {
					return tenantDomainQueries.create(doms)
				})
				const domainCreationResponse = await Promise.all(tenantDomainCreatePromises)

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
				if (rollbackStack.size() > 0) await rollbackStack.execute()

				return responses.failureResponse({
					statusCode: httpStatusCode.bad_request,
					message: 'TENANT_DOMAIN_ALREADY_EXISTS',
					result: {},
				})
			}

			try {
				const defaultOrgCreateBody = {
					name: process.env.DEFAULT_TENANT_ORG_NAME,
					code: process.env.DEFAULT_TENANT_ORG_CODE,
					tenant_code: tenantCreateResponse.code,
					description: '',
					domains: [],
				}
				const defaultOrgCreateResponse = await organisationService.create(defaultOrgCreateBody, userId)
				if (!defaultOrgCreateResponse.result.id) {
					if (rollbackStack.size() > 0) await rollbackStack.execute()
					throw new Error('Default Org creation Failed')
				}

				const defaultOrgId = defaultOrgCreateResponse.result.id

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
						process.env.DEFAULT_ORG_ID
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
}
