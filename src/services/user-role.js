/**
 * name : userRole.js
 * author : Priyanka Pradeep
 * created-date : 21-July-2023
 * Description : UserRole Service Helper.
 */

// Dependencies

const httpStatusCode = require('@generics/http-status')
const roleQueries = require('@database/queries/user-role')
const common = require('@constants/common')
const { Op } = require('sequelize')
const organizationQueries = require('@database/queries/organization')
const responses = require('@helpers/responses')
const utils = require('@generics/utils')
const cacheClient = require('@generics/cacheHelper')

module.exports = class userRoleHelper {
	/**
	 * Create a new role.
	 * @method
	 * @name create
	 * @param {Object} bodyData - Role creation data.
	 * @param {string} bodyData.title - Title of the role.
	 * @param {number} bodyData.userType - User type of the role.
	 * @param {string} bodyData.status - Status of the role.
	 * @param {string} bodyData.translations - Translations for the role.
	 * @param {string} bodyData.visibility - Visibility of the role.
	 * @param {number} userOrganizationId - ID of the organization creating the role.
	 * @param {string} tenantCode - Tenant code of the requestor.
	 * @returns {Promise<Object>} - Created role response.
	 */

	static async create(bodyData, userOrganizationId, tenantCode) {
		try {
			bodyData.organization_id = userOrganizationId
			bodyData.tenant_code = tenantCode
			const roles = await roleQueries.create(bodyData)
			return responses.successResponse({
				statusCode: httpStatusCode.created,
				message: 'ROLE_CREATED_SUCCESSFULLY',
				result: {
					id: roles.id,
					title: roles.title,
					user_type: roles.user_type,
					status: roles.status,
					visibility: roles.visibility,
					organization_id: roles.organization_id,
					tenant_code: roles.tenant_code,
					translations: roles.translations,
				},
			})
		} catch (error) {
			if (error.name === common.SEQUELIZE_UNIQUE_CONSTRAINT_ERROR) {
				return responses.failureResponse({
					statusCode: httpStatusCode.conflict,
					responseCode: 'CLIENT_ERROR',
					message: 'ROLE_IS_NOT_UNIQUE',
				})
			}
			throw error
		}
	}

	/**
	 * Update a role by ID.
	 * @method
	 * @name update
	 * @param {number} id - Role ID to be updated.
	 * @param {Object} bodyData - Role update data.
	 * @param {string} bodyData.title - Title of the role.
	 * @param {number} bodyData.userType - User type of the role.
	 * @param {string} bodyData.status - Status of the role.
	 * @param {string} bodyData.visibility - Visibility of the role.
	 * @param {string} bodyData.translations - Translations for the role.
	 * @param {number} userOrganizationId - ID of the organization.
	 * @param {string} tenantCode - Tenant code of the requestor.
	 * @returns {Promise<Object>} - Updated role response.
	 */

	static async update(id, bodyData, userOrganizationId, userOrganizationCode, tenantCode) {
		try {
			const filter = { id: id, organization_id: userOrganizationId, tenant_code: tenantCode }
			const [updateCount, updateRole] = await roleQueries.updateRole(filter, bodyData)
			if (updateCount == 0) {
				return responses.failureResponse({
					message: 'ROLE_NOT_UPDATED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			await cacheClient
				.invalidateOrgNamespaceVersion({
					tenantCode,
					orgId: userOrganizationCode,
					ns: common.CACHE_CONFIG.namespaces.organization.name,
				})
				.catch((error) => {
					console.error(error)
				})
			await cacheClient
				.invalidateOrgNamespaceVersion({
					tenantCode,
					orgId: userOrganizationCode,
					ns: common.CACHE_CONFIG.namespaces.profile.name,
				})
				.catch((error) => {
					console.error(error)
				})

			return responses.successResponse({
				statusCode: httpStatusCode.created,
				message: 'ROLE_UPDATED_SUCCESSFULLY',
				result: {
					title: updateRole[0].title,
					label: updateRole[0].label,
					user_type: updateRole[0].user_type,
					status: updateRole[0].status,
					visibility: updateRole[0].visibility,
					organization_id: updateRole[0].organization_id,
					translations: updateRole[0].translations,
				},
			})
		} catch (error) {
			if (error.name === common.SEQUELIZE_UNIQUE_CONSTRAINT_ERROR) {
				return responses.failureResponse({
					statusCode: httpStatusCode.conflict,
					responseCode: 'CLIENT_ERROR',
					message: 'ROLE_IS_NOT_UNIQUE',
				})
			}
			throw error
		}
	}

	/**
	 * Delete a role by ID.
	 * @method
	 * @name delete
	 * @param {number} id - Role ID to be deleted.
	 * @param {number} userOrganizationId - ID of the organization.
	 * @param {string} tenantCode - Tenant code of the requestor.
	 * @returns {Promise<Object>} - Deletion result response.
	 */

	static async delete(id, userOrganizationId, userOrganizationCode, tenantCode) {
		try {
			const filter = { id: id, organization_id: userOrganizationId, tenant_code: tenantCode }
			const deleteRole = await roleQueries.deleteRole(filter)

			if (deleteRole === 0) {
				return responses.failureResponse({
					message: 'ROLE_ALREADY_DELETED_OR_ROLE_NOT_PRESENT',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			await cacheClient
				.invalidateOrgNamespaceVersion({
					tenantCode,
					orgId: userOrganizationCode,
					ns: common.CACHE_CONFIG.namespaces.organization.name,
				})
				.catch((error) => {
					console.error(error)
				})
			await cacheClient
				.invalidateOrgNamespaceVersion({
					tenantCode,
					orgId: userOrganizationCode,
					ns: common.CACHE_CONFIG.namespaces.profile.name,
				})
				.catch((error) => {
					console.error(error)
				})

			return responses.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'ROLE_DELETED_SUCCESSFULLY',
				result: {},
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * List roles for an organization and default roles.
	 * @method
	 * @name list
	 * @param {Object} filters - Filter parameters.
	 * @param {number} page - Current page number.
	 * @param {number} limit - Number of records per page.
	 * @param {string} search - Search text for role title.
	 * @param {number} userOrganizationId - Organization ID of the requester.
	 * @param {string} tenantCode - Tenant code of the requester.
	 * @param {string} [language] - Preferred language for labels.
	 * @returns {Promise<Object>} - Paginated list of roles.
	 */

	static async list(filters, page, limit, search, userOrganizationId, tenantCode, language) {
		try {
			delete filters.search
			delete filters.language
			const offset = common.getPaginationOffset(page, limit)
			const options = {
				offset,
				limit,
			}
			let defaultOrg = await organizationQueries.findOne(
				{ code: process.env.DEFAULT_ORGANISATION_CODE, tenant_code: tenantCode },
				{ attributes: ['id'] }
			)
			let defaultOrgId = defaultOrg.id
			const filter = {
				[Op.or]: [{ organization_id: userOrganizationId }, { organization_id: defaultOrgId }],
				title: { [Op.iLike]: `%${search}%` },
				...filters,
				tenant_code: tenantCode,
			}
			const attributes = [
				'id',
				'title',
				'user_type',
				'visibility',
				'label',
				'status',
				'organization_id',
				'translations',
				'tenant_code',
			]
			const roles = await roleQueries.findAllRoles(filter, attributes, options)

			if (roles.rows == 0 || roles.count == 0) {
				return responses.failureResponse({
					message: 'ROLES_HAS_EMPTY_LIST',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			if (language && language !== common.ENGLISH_LANGUAGE_CODE) {
				utils.setRoleLabelsByLanguage(roles.rows, language)
			} else {
				roles.rows.map((labels) => {
					delete labels.translations
					return labels
				})
			}

			const results = {
				data: roles.rows,
				count: roles.count,
			}

			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'ROLES_FETCHED_SUCCESSFULLY',
				result: results,
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * @deprecated
	 * This method is deprecated. Use `list()` instead.
	 * @method
	 * @name defaultList
	 * @param {Object} filters - Filter parameters.
	 * @param {number} page - Current page number.
	 * @param {number} limit - Number of records per page.
	 * @param {string} search - Search text for role title.
	 * @returns {Promise<Object>} - Paginated list of default organization roles.
	 */

	/* static async defaultList(filters, page, limit, search) {
		try {
			delete filters.search
			const offset = common.getPaginationOffset(page, limit)
			const options = {
				offset,
				limit,
			}
			let defaultOrg = await organizationQueries.findOne(
				{ code: process.env.DEFAULT_ORGANISATION_CODE },
				{ attributes: ['id'] }
			)
			let defaultOrgId = defaultOrg.id
			const filter = {
				organization_id: defaultOrgId,
				title: { [Op.iLike]: `%${search}%` },
				...filters,
			}
			const attributes = ['id', 'title', 'user_type', 'visibility', 'status', 'organization_id']
			const roles = await roleQueries.findAllRoles(filter, attributes, options)

			if (roles.rows == 0 || roles.count == 0) {
				return responses.failureResponse({
					message: 'ROLES_HAS_EMPTY_LIST',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			const results = {
				data: roles.rows,
				count: roles.count,
			}

			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'ROLES_FETCHED_SUCCESSFULLY',
				result: results,
			})
		} catch (error) {
			throw error
		}
	} */
}
