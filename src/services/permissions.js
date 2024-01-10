// Dependencies
const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const permissionsQueries = require('@database/queries/permissions')
const { UniqueConstraintError, ForeignKeyConstraintError } = require('sequelize')
const { Op } = require('sequelize')

module.exports = class PermissionsHelper {
	/**
	 * Create permissions.
	 * @method
	 * @name create
	 * @param {Object} bodyData - permissions body data.
	 * @param {String} id -  id.
	 * @returns {JSON} - Permissions created response.
	 */

	static async create(bodyData) {
		try {
			const permissions = await permissionsQueries.createPermission(bodyData)
			return common.successResponse({
				statusCode: httpStatusCode.created,
				message: 'PERMISSION_CREATED_SUCCESSFULLY',
				result: {
					Id: permissions.id,
					status: permissions.status,
					module: permissions.module,
					actions: permissions.actions,
				},
			})
		} catch (error) {
			if (error instanceof UniqueConstraintError) {
				return common.failureResponse({
					message: 'PERMISSION_ALREADY_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			throw error
		}
	}

	/**
	 * Update permissions.
	 * @method
	 * @name update
	 * @param {Object} bodyData - permissions body data.
	 * @param {String} _id - permissions id.
	 * @param {String} loggedInUserId - logged in user id.
	 * @returns {JSON} - permissions updated response.
	 */

	static async update(id, bodyData) {
		try {
			const filter = { id }
			const permissions = await permissionsQueries.findPermissionById(id)
			if (!permissions) {
				throw new Error('PERMISSION_NOT_FOUND')
			}
			const updatedPermission = await permissionsQueries.updatePermissions(filter, bodyData)
			if (!updatedPermission) {
				return common.failureResponse({
					message: 'PERMISSION_NOT_UPDATED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			} else {
				return common.successResponse({
					statusCode: httpStatusCode.created,
					message: 'PERMISSION_UPDATED_SUCCESSFULLY',
					result: {
						Id: updatedPermission.id,
						status: updatedPermission.status,
						module: updatedPermission.module,
						actions: updatedPermission.actions,
					},
				})
			}
		} catch (error) {
			throw error
		}
	}

	/**
	 * Delete permissions.
	 * @method
	 * @name delete
	 * @param {String} _id - Delete permissions.
	 * @returns {JSON} - permissions deleted response.
	 */

	static async delete(id) {
		try {
			const permissions = await permissionsQueries.findPermissionById(id)

			if (!permissions) {
				throw new Error('PERMISSION_NOT_FOUND')
			}
			const deletePermission = await permissionsQueries.deletePermissionById(id)
			if (!deletePermission) {
				return common.failureResponse({
					message: 'PERMISSION_NOT_DELETED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			return common.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'PERMISSION_DELETED_SUCCESSFULLY',
				result: {},
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * list permissions.
	 * @method
	 * @name list
	 * @param {String} id -  id.
	 * @returns {JSON} - Permissions list response.
	 */

	static async list(page, limit, search) {
		try {
			const offset = common.getPaginationOffset(page, limit)

			const filter = {
				code: { [Op.iLike]: `%${search}%` },
			}
			const options = {
				offset,
				limit,
			}
			const attributes = ['id', 'code', 'module', 'actions', 'status']
			const permissions = await permissionsQueries.findAllPermissions(filter, attributes, options)

			if (permissions.rows == 0 || permissions.count == 0) {
				return common.failureResponse({
					message: 'PERMISSION_HAS_EMPTY_LIST',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			} else {
				const results = {
					data: permissions.rows,
					count: permissions.count,
				}

				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'PERMISSION_FETCHED_SUCCESSFULLY',
					result: { results },
				})
			}
		} catch (error) {
			throw error
		}
	}
}
