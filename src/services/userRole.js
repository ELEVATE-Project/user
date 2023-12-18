/**
 * name : userRole.js
 * author : Priyanka Pradeep
 * created-date : 21-July-2023
 * Description : UserRole Service Helper.
 */

// Dependencies

const httpStatusCode = require('@generics/http-status')
const roleQueries = require('@database/queries/userRole')
const common = require('@constants/common')
const { Op } = require('sequelize')

module.exports = class userRoleHelper {
	/**
	 * create role
	 * @method
	 * @name create
	 * @param {Object} req -request data.
	 * @param {Object} req.body -request body contains role creation deatils.
	 * @param {String} req.body.title - title of the role.
	 * @param {Integer} req.body.userType - userType role .
	 * @param {String} req.body.status - role status.
	 * @param {String} req.body.visibility - visibility of the role.
	 * @param {Integer} req.body.organization_id - organization for role.
	 * @returns {JSON} - response contains role creation details.
	 */
	static async create(bodyData) {
		try {
			const roles = await roleQueries.create(bodyData)
			return common.successResponse({
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
	 * update role
	 * @method
	 * @name update
	 * @param {Object} req -request data.
	 * @param {Object} req.body -request body contains role updation details.
	 * @param {String} req.body.title - title of the role.
	 * @param {Integer} req.body.userType - userType role .
	 * @param {String} req.body.status - role status.
	 * @param {String} req.body.visibility - visibility of the role.
	 * @param {Integer} req.body.organization_id - organization for role.
	 * @returns {JSON} - response contains role updation details.
	 */

	static async update(id, bodyData) {
		try {
			const roles = await roleQueries.findRoleById(id)
			if (!roles) {
				throw new Error('ROLE_NOT_FOUND')
			}

			const updateRole = await roleQueries.updateRoleById(id, bodyData)
			if (!updateRole) {
				return common.failureResponse({
					message: 'ROLE_NOT_UPDATED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			return common.successResponse({
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
	 * delete role
	 * @method
	 * @name delete
	 * @param {Object} req - request data.
	 * @returns {JSON} - role deletion response.
	 */
	static async delete(id) {
		try {
			const roles = await roleQueries.findRoleById(id)

			if (!roles) {
				return common.failureResponse({
					message: 'ROLE_ALREADY_DELETED_OR_ROLE_NOT_PRESENT',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			} else {
				const deleteRole = await roleQueries.deleteRoleById(id)

				if (!deleteRole) {
					return common.failureResponse({
						message: 'ROLE_NOT_DELETED',
						statusCode: httpStatusCode.bad_request,
						responseCode: 'CLIENT_ERROR',
					})
				}
				return common.successResponse({
					statusCode: httpStatusCode.accepted,
					message: 'ROLE_DELETED_SUCCESSFULLY',
					result: {},
				})
			}
		} catch (error) {
			throw error
		}
	}

	/**
	 * Get all available roles
	 * @method
	 * @name list
	 * @param {String} req.pageNo - Page No.
	 * @param {String} req.pageSize - Page size limit.
	 * @param {String} req.searchText - Search text.
	 * @returns {JSON} - role List.
	 */
	static async list(filters, page, limit, search) {
		try {
			const offset = common.getPaginationOffset(page, limit)
			const options = {
				offset,
				limit,
			}
			const filter = {
				title: { [Op.iLike]: `%${search}%` },
				...filters,
			}
			const attributes = ['id', 'title', 'user_type', 'visibility', 'status', 'organization_id']
			let userroleModel = await roleQueries.getcolumn()
			const invalidColumns = Object.keys(filters).filter((key) => !userroleModel.includes(key))

			if (invalidColumns.length > 0) {
				return common.failureResponse({
					message: 'COLUMN_DOES_NOT_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const roles = await roleQueries.findAllRoles(filter, attributes, options)

			if (roles.rows == 0 || roles.count == 0) {
				return common.failureResponse({
					message: 'ROLES_HAS_EMPTY_LIST',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			} else {
				const results = {
					data: roles.rows,
					count: roles.count,
				}

				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'ROLES_FETCHED_SUCCESSFULLY',
					result: results,
				})
			}
		} catch (error) {
			throw error
		}
	}
}
