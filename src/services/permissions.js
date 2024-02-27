// Dependencies
const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const permissionsQueries = require('@database/queries/permissions')
const { UniqueConstraintError, ForeignKeyConstraintError } = require('sequelize')
const { Op } = require('sequelize')
const responses = require('@helpers/responses')

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
			return responses.successResponse({
				statusCode: httpStatusCode.created,
				message: 'PERMISSION_CREATED_SUCCESSFULLY',
				result: {
					Id: permissions.id,
					status: permissions.status,
					module: permissions.module,
					request_type: permissions.request_type,
				},
			})
		} catch (error) {
			if (error instanceof UniqueConstraintError) {
				const uniqueConstraintErrors = error.errors
				const uniqueFields = uniqueConstraintErrors.map((constraintError) => {
					return constraintError.path
				})
				const isCodeUnique = uniqueFields.includes('code')
				let errorMessage = ''
				if (!isCodeUnique) {
					errorMessage += 'code '
				}
				return responses.failureResponse({
					message: `${errorMessage.trim()} should be unique.`,
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
				return responses.failureResponse({
					message: 'PERMISSION_NOT_UPDATED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			} else {
				return responses.successResponse({
					statusCode: httpStatusCode.created,
					message: 'PERMISSION_UPDATED_SUCCESSFULLY',
					result: {
						Id: updatedPermission.id,
						status: updatedPermission.status,
						module: updatedPermission.module,
						request_type: permissions.request_type,
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
				return responses.failureResponse({
					message: 'PERMISSION_NOT_DELETED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			return responses.successResponse({
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
			const attributes = ['id', 'code', 'module', 'request_type', 'api_path', 'status']
			const permissions = await permissionsQueries.findAllPermissions(filter, attributes, options)

			if (permissions.rows == 0 || permissions.count == 0) {
				return responses.failureResponse({
					message: 'PERMISSION_HAS_EMPTY_LIST',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			} else {
				const results = {
					data: permissions.rows,
					count: permissions.count,
				}

				return responses.successResponse({
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
