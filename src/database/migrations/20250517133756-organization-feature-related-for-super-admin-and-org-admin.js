'use strict'

require('module-alias/register')
const common = require('@constants/common')
const Permission = require('@database/models/index')

const getPermissionId = async (module, request_type, api_path) => {
	try {
		const permission = await Permission.findOne({ where: { module, request_type, api_path } })
		if (!permission) throw new Error('Permission not found')
		return permission.id
	} catch (error) {
		throw error
	}
}

const MODULE_CODE = 'organization-feature'
const PERMISSIONS = {
	CRUD: {
		code: 'organization_feature_crud',
		request_type: ['POST', 'GET', 'PATCH', 'DELETE'],
		api_path: '/user/v1/organization-feature/*',
	},
	READ: {
		code: 'organization_feature_public',
		request_type: ['GET'],
		api_path: '/user/v1/organization-feature/read*',
	},
}

const getTimestamp = () => new Date()

module.exports = {
	up: async (queryInterface) => {
		try {
			// Insert module
			await queryInterface.bulkInsert('modules', [
				{ code: MODULE_CODE, status: 'ACTIVE', created_at: getTimestamp(), updated_at: getTimestamp() },
			])

			// Insert permissions
			const permissionsData = Object.values(PERMISSIONS).map((permission) => ({
				...permission,
				module: MODULE_CODE,
				status: 'ACTIVE',
				created_at: getTimestamp(),
				updated_at: getTimestamp(),
			}))
			await queryInterface.bulkInsert('permissions', permissionsData)

			// Fetch permission IDs
			const [crudId, readId] = await Promise.all([
				getPermissionId(MODULE_CODE, PERMISSIONS.CRUD.request_type, PERMISSIONS.CRUD.api_path),
				getPermissionId(MODULE_CODE, PERMISSIONS.READ.request_type, PERMISSIONS.READ.api_path),
			])

			const buildRolePermission = (role, permissionId, { request_type, api_path }) => ({
				role_title: role,
				permission_id: permissionId,
				module: MODULE_CODE,
				request_type,
				api_path,
				created_at: getTimestamp(),
				updated_at: getTimestamp(),
				created_by: 0,
			})

			const rolePermissionsData = [
				buildRolePermission(common.ADMIN_ROLE, crudId, PERMISSIONS.CRUD),
				buildRolePermission(common.ORG_ADMIN_ROLE, crudId, PERMISSIONS.CRUD),
				...[common.USER_ROLE, common.MENTEE_ROLE, common.MENTOR_ROLE, common.SESSION_MANAGER_ROLE].map((role) =>
					buildRolePermission(role, readId, PERMISSIONS.READ)
				),
			]

			await queryInterface.bulkInsert('role_permission_mapping', rolePermissionsData)
		} catch (error) {
			console.error('Migration error:', error)
		}
	},

	down: async (queryInterface) => {
		const [crudId, readId] = await Promise.all([
			getPermissionId(MODULE_CODE, PERMISSIONS.CRUD.request_type, PERMISSIONS.CRUD.api_path),
			getPermissionId(MODULE_CODE, PERMISSIONS.READ.request_type, PERMISSIONS.READ.api_path),
		])

		const deleteRolePermission = (role, id, api_path) =>
			queryInterface.bulkDelete('role_permission_mapping', {
				role_title: role,
				permission_id: id,
				api_path,
			})

		await Promise.all([
			deleteRolePermission(common.ADMIN_ROLE, crudId, PERMISSIONS.CRUD.api_path),
			deleteRolePermission(common.ORG_ADMIN_ROLE, crudId, PERMISSIONS.CRUD.api_path),
			deleteRolePermission(common.USER_ROLE, readId, PERMISSIONS.READ.api_path),
			deleteRolePermission(common.MENTEE_ROLE, readId, PERMISSIONS.READ.api_path),
			deleteRolePermission(common.MENTOR_ROLE, readId, PERMISSIONS.READ.api_path),
			deleteRolePermission(common.SESSION_MANAGER_ROLE, readId, PERMISSIONS.READ.api_path),
		])

		await Promise.all([
			queryInterface.bulkDelete('permissions', { id: crudId }),
			queryInterface.bulkDelete('permissions', { id: readId }),
			queryInterface.bulkDelete('modules', { code: MODULE_CODE }),
		])
	},
}
