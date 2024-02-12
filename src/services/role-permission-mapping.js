const httpStatusCode = require('@generics/http-status')
const rolePermissionMappingQueries = require('@database/queries/role-permission-mapping')
const permissionsQueries = require('@database/queries/permissions')
const { UniqueConstraintError } = require('sequelize')
const responses = require('@helpers/responses')
const common = require('@constants/common')

module.exports = class modulesHelper {
	/**
	 * Create rolePermission.
	 * @method
	 * @name create
	 * @param {String} roleTitle - user Role Title
	 * @param {Integer} permissionId - role permissionId
	 * @param {Integer} id - user Id
	 * @returns {JSON} - RolePermission creation object.
	 */

	static async create(roleTitle, permissionId, id) {
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
				role_title: roleTitle,
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
					role_title: rolePermissionMapping.role_title,
					permission_id: rolePermissionMapping.permission_id,
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
	 * @param {String} roleTitle - user Role Title
	 * @param {Integer} permissionId - role permissionId
	 * @returns {JSON} - rolePermission deletion object.
	 */

	static async delete(roleTitle, permissionId) {
		try {
			const filter = { role_title: roleTitle, permission_id: permissionId }
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

	static async list(roleTitles) {
		try {
			const filter = { role_title: roleTitles }
			const attributes = ['module', 'request_type']
			const permissionAndModules = await rolePermissionMappingQueries.findAll(filter, attributes)
			const permissionsByModule = {}
			permissionAndModules.forEach(({ module, request_type }) => {
				if (permissionsByModule[module]) {
					permissionsByModule[module].request_type = [
						...new Set([...permissionsByModule[module].request_type, ...request_type]),
					]
				} else {
					permissionsByModule[module] = { module, request_type: [...request_type] }
				}
			})

			const permissions = Object.values(permissionsByModule).map(({ module, request_type }) => ({
				module,
				request_type,
				service: common.USER_SERVICE,
			}))

			if (!permissions.length) {
				return responses.successResponse({
					statusCode: httpStatusCode.created,
					message: 'ROLE_PERMISSION_NOT_FOUND',
					result: { permissions: [] },
				})
			}
			return responses.successResponse({
				statusCode: httpStatusCode.created,
				message: 'FETCHED_ROLE_PERMISSION_SUCCESSFULLY',
				result: { permissions },
			})
		} catch (error) {
			throw error
		}
	}
}
