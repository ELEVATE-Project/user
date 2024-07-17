'use strict'

require('module-alias/register')
require('dotenv').config()
const Permissions = require('@database/models/index').Permission
const RolePermissionMapping = require('@database/models/index').RolePermission

const getPermissionId = async (module, request_type, api_path) => {
	const permission = await Permissions.findOne({
		where: { module, request_type, api_path },
	})
	if (!permission) {
		throw new Error(
			`Permission not found for module: ${module}, request_type: ${request_type}, api_path: ${api_path}`
		)
	}
	return permission.id
}

const defaultRoles = process.env.DEFAULT_ROLE.split(',') || []

const rolePermissions = [
	{
		module: 'user',
		request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
		api_path: '/user/v1/user/*',
	},
	{
		module: 'form',
		request_type: ['POST'],
		api_path: '/user/v1/form/read*',
	},
	{
		module: 'cloud-services',
		request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
		api_path: '/user/v1/cloud-services/*',
	},
	{
		module: 'organization',
		request_type: ['POST'],
		api_path: '/user/v1/organization/requestOrgRole',
	},
	{
		module: 'organization',
		request_type: ['GET'],
		api_path: '/user/v1/organization/*',
	},
	{
		module: 'entity-type',
		request_type: ['POST'],
		api_path: '/user/v1/entity-type/read',
	},
	{
		module: 'entity',
		request_type: ['GET'],
		api_path: '/user/v1/entity/read*',
	},
	{
		module: 'account',
		request_type: ['GET'],
		api_path: '/user/v1/account/list',
	},
	{
		module: 'account',
		request_type: ['POST'],
		api_path: '/user/v1/account/logout',
	},
	{
		module: 'account',
		request_type: ['POST'],
		api_path: '/user/v1/account/search',
	},
	{
		module: 'user-role',
		request_type: ['GET'],
		api_path: '/user/v1/user-role/list',
	},
]

module.exports = {
	up: async (queryInterface, Sequelize) => {
		try {
			for (const role of defaultRoles) {
				const rolePermissionsData = await Promise.all(
					rolePermissions.map(async (perm) => ({
						role_title: role,
						permission_id: await getPermissionId(perm.module, perm.request_type, perm.api_path),
						module: perm.module,
						request_type: perm.request_type,
						api_path: perm.api_path,
					}))
				)

				//remove if permission is already there
				const bulkInsertData = await Promise.all(
					rolePermissionsData.map(async (data) => {
						const exists = await RolePermissionMapping.findOne({
							where: {
								role_title: data.role_title,
								permission_id: data.permission_id,
							},
						})

						if (!exists) {
							return {
								...data,
								created_at: new Date(),
								updated_at: new Date(),
								created_by: 0,
							}
						}
					})
				).then((results) => results.filter(Boolean))

				if (bulkInsertData.length > 0) {
					await queryInterface.bulkInsert('role_permission_mapping', bulkInsertData)
				}
			}
		} catch (error) {
			console.error(`Migration error: ${error.message}`)
			throw error
		}
	},

	down: async (queryInterface, Sequelize) => {
		try {
			await queryInterface.bulkDelete('role_permission_mapping', null, {})
		} catch (error) {
			console.error(`Rollback migration error: ${error.message}`)
			throw error
		}
	},
}
