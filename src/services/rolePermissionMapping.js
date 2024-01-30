const httpStatusCode = require('@generics/http-status')
const rolePermissionMappingQueries = require('@database/queries/rolePermissionMapping')
const permissionsQueries = require('@database/queries/permissions')
const { UniqueConstraintError, ForeignKeyConstraintError } = require('sequelize')
const { Op } = require('sequelize')
const responses = require('@helpers/responses')

module.exports = class modulesHelper {
	/**
	 * Create rolePermission.
	 * @method
	 * @name create
	 * @param {Integer} roleId - user roleId
	 * @param {Integer} permissionId - role permissionId
	 * @param {Integer} id - user Id
	 * @returns {JSON} - RolePermission creation object.
	 */

	static async create(roleId, permissionId, id) {
		try {
			const permission = await permissionsQueries.findPermissionId(permissionId)
			if (!permission) {
				return responses.failureResponse({
					message: 'PERMISSION_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			const data = {
				role_id: roleId,
				permission_id: permissionId,
				module: permission.module,
				request_type: permission.request_type,
				api_path: permission.api_path,
				created_by: id,
			}
			const rolePermissionMapping = await rolePermissionMappingQueries.create(data)
			return responses.successResponse({
				statusCode: httpStatusCode.created,
				message: 'ROLE_PERMISSION_CREATED_SUCCESSFULLY',
				result: {
					roleId: rolePermissionMapping.role_id,
					permissionId: rolePermissionMapping.permission_id,
					module: rolePermissionMapping.module,
					request_type: rolePermissionMapping.request_type,
				},
			})
		} catch (error) {
			if (error instanceof UniqueConstraintError) {
				return responses.failureResponse({
					message: 'ROLE_PERMISSION_ALREADY_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			throw error
		}
	}

	/**
	 * Delete rolePermission.
	 * @method
	 * @name delete
	 * @param {Integer} roleId - user roleId
	 * @param {Integer} permissionId - role permissionId
	 * @returns {JSON} - rolePermission deletion object.
	 */

	static async delete(roleId, permissionId) {
		try {
			const filter = { role_id: roleId, permission_id: permissionId }
			const rolePermissionMapping = await rolePermissionMappingQueries.delete(filter)
			if (rolePermissionMapping == 0) {
				return responses.failureResponse({
					message: 'ROLE_PERMISSION_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			return responses.successResponse({
				statusCode: httpStatusCode.created,
				message: 'ROLE_PERMISSION_DELETED_SUCCESSFULLY',
				result: {},
			})
		} catch (error) {
			throw error
		}
	}
}
