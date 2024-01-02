const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const rolePermissionMappingQueries = require('@database/queries/rolePermissionMapping')
const permissionsQueries = require('@database/queries/permissions')
const { UniqueConstraintError, ForeignKeyConstraintError } = require('sequelize')
const { Op } = require('sequelize')

module.exports = class modulesHelper {
	/**
	 * Create rolePermission.
	 * @method
	 * @name create
	 * @param {Object} req - Request data.
	 * @returns {JSON} - RolePermission creation object.
	 */

	static async create(role_id, permission_id) {
		try {
			const permission = await permissionsQueries.findPermissionId(permission_id)
			const Data = {
				role_id,
				permission_id,
				module: permission.module,
				actions: permission.actions,
			}
			const rolepermissionmapping = await rolePermissionMappingQueries.create(Data)
			return common.successResponse({
				statusCode: httpStatusCode.created,
				message: 'ROLE_PERMISSION_MAPPING_CREATED_SUCCESSFULLY',
				result: {
					role_Id: rolepermissionmapping.role_id,
					permission_Id: rolepermissionmapping.permission_id,
					module: rolepermissionmapping.module,
					actions: rolepermissionmapping.actions,
				},
			})
		} catch (error) {
			if (error instanceof UniqueConstraintError) {
				return common.failureResponse({
					message: 'ROLE_PERMISSION_MAPPING_ALREADY_EXISTS',
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
	 * @param {Object} req - Request data.
	 * @returns {JSON} - RolePermission deletion object.
	 */

	static async delete(role_id, permission_id) {
		try {
			const filter = { role_id, permission_id }
			const rolepermissionmapping = await rolePermissionMappingQueries.delete(filter)
			return common.successResponse({
				statusCode: httpStatusCode.created,
				message: 'ROLE_PERMISSION_MAPPING_DELETED_SUCCESSFULLY',
				result: {},
			})
		} catch (error) {
			if (error instanceof UniqueConstraintError) {
				return common.failureResponse({
					message: 'ROLE_PERMISSION_MAPPING_ALREADY_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			throw error
		}
	}
}
