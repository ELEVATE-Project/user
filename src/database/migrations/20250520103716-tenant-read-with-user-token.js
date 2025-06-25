'use strict'

require('module-alias/register')
const common = require('@constants/common')
const Permissions = require('@database/models/index').Permission

const getPermissionId = async (module, request_type, api_path) => {
	try {
		const permission = await Permissions.findOne({
			where: { module, request_type, api_path },
		})

		if (!permission) {
			throw permission
		}

		return permission.id
	} catch (error) {
		throw error
	}
}

module.exports = {
	up: async (queryInterface, Sequelize) => {
		try {
			const permissionsData = [
				{
					code: 'tenant_read_with_token',
					module: 'tenant',
					request_type: ['GET'],
					api_path: '/user/v1/tenant/read',
					status: 'ACTIVE',
					created_at: new Date(),
					updated_at: new Date(),
				},
			]

			await queryInterface.bulkInsert('permissions', permissionsData)

			//create role permission mapping
			const rolePermissionsData = [
				{
					role_title: common.PUBLIC_ROLE,
					permission_id: await getPermissionId('tenant', ['GET'], '/user/v1/tenant/read'),
					module: 'tenant',
					request_type: ['POST', 'GET'],
					api_path: '/user/v1/tenant/read',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
			]

			await queryInterface.bulkInsert('role_permission_mapping', rolePermissionsData)
		} catch (error) {
			console.error(error)
		}
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('role_permission_mapping', {
			api_path: '/user/v1/tenant/read',
			role_title: common.USER_ROLE,
			permission_id: await getPermissionId('tenant', ['GET'], '/user/v1/tenant/read'),
		})
		await queryInterface.bulkDelete('permissions', {
			id: await getPermissionId('tenant', ['GET'], '/user/v1/tenant/read'),
		})
	},
}
