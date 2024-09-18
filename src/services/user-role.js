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

module.exports = class userRoleHelper {
	/**
	 * Create roles.
	 * @method
	 * @name create
	 * @param {Object} req - Request data.
	 * @param {Object} req.body - Request body contains role creation details.
	 * @param {String} req.body.title - Title of the role.
	 * @param {Integer} req.body.userType - User type of the role.
	 * @param {String} req.body.status - Role status.
	 * @param {String} req.body.visibility - Visibility of the role.
	 * @param {Integer} req.body.organization_id - Organization ID for the role.
	 * @returns {JSON} - Response contains role creation details.
	 */
	static async create(bodyData, userOrganizationId) {
		try {
			bodyData.organization_id = userOrganizationId
			const roles = await roleQueries.create(bodyData)
			return responses.successResponse({
				statusCode: httpStatusCode.created,
				message: 'ROLE_CREATED_SUCCESSFULLY',
				result: {
					title: roles.title,
					user_type: roles.user_type,
					status: roles.status,
					visibility: roles.visibility,
					organization_id: roles.organization_id,
				},
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * Update roles.
	 * @method
	 * @name update
	 * @param {Object} req - Request data.
	 * @param {Object} req.body - Request body contains role update details.
	 * @param {String} req.body.title - Title of the role.
	 * @param {Integer} req.body.userType - User type of the role.
	 * @param {String} req.body.status - Role status.
	 * @param {String} req.body.visibility - Visibility of the role.
	 * @param {Integer} req.body.organization_id - Organization ID for the role.
	 * @returns {JSON} - Response contains role update details.
	 */

	static async update(id, bodyData, userOrganizationId) {
		try {
			const filter = { id: id, organization_id: userOrganizationId }
			const [updateCount, updateRole] = await roleQueries.updateRole(filter, bodyData)
			if (updateCount == 0) {
				return responses.failureResponse({
					message: 'ROLE_NOT_UPDATED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			return responses.successResponse({
				statusCode: httpStatusCode.created,
				message: 'ROLE_UPDATED_SUCCESSFULLY',
				result: {
					title: updateRole.title,
					user_type: updateRole.user_type,
					status: updateRole.status,
					visibility: updateRole.visibility,
					organization_id: updateRole.organization_id,
				},
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * Delete role.
	 * @method
	 * @name delete
	 * @param {Object} req - Request data.
	 * @returns {JSON} - Role deletion response.
	 */
	static async delete(id, userOrganizationId) {
		try {
			const filter = { id: id, organization_id: userOrganizationId }
			const deleteRole = await roleQueries.deleteRole(filter)

			if (deleteRole === 0) {
				return responses.failureResponse({
					message: 'ROLE_NOT_DELETED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

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
	 * Get all available roles.
	 * @method
	 * @name list
	 * @param {Array(String)} req.body.filters - Filters.
	 * @param {String} req.pageNo - Page number.
	 * @param {String} req.pageSize - Page size limit.
	 * @param {String} req.searchText - Search text.
	 * @param {Integer} req.decodedToken.organization_id - user organization_id.
	 * @returns {JSON} - Role list.
	 */

	static async list(filters, page, limit, search, userOrganizationId) {
		try {
			let result = {
				data: [],
				count: 0,
			}
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
				[Op.or]: [{ organization_id: userOrganizationId }, { organization_id: defaultOrgId }],
				title: { [Op.iLike]: `%${search}%` },
				...filters,
			}
			const attributes = ['id', 'title', 'user_type', 'visibility', 'status', 'organization_id']
			const roles = await roleQueries.findAllRoles(filter, attributes, options)

			if (!roles.rows.length > 0 || roles.count == 0) {
				return responses.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'ROLES_FETCHED_SUCCESSFULLY',
					result,
				})
			}

			result.data = roles.rows
			result.count = roles.count

			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'ROLES_FETCHED_SUCCESSFULLY',
				result,
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * Get all available roles.
	 * @method
	 * @name defaultlist
	 * @param {Array(String)} req.body.filters - Filters.
	 * @param {String} req.pageNo - Page number.
	 * @param {String} req.pageSize - Page size limit.
	 * @param {String} req.searchText - Search text.
	 * @returns {JSON} - Role list.
	 */
	static async defaultList(filters, page, limit, search) {
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
	}
}
