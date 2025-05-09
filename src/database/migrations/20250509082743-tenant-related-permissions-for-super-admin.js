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
			//create module
			const modulesData = [{ code: 'tenant', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() }]

			// Insert the data into the 'modules' table
			await queryInterface.bulkInsert('modules', modulesData)

			const permissionsData = [
				{
					code: 'tenant_crud',
					module: 'tenant',
					request_type: ['POST', 'GET'],
					api_path: '/user/v1/tenant/*',
					status: 'ACTIVE',
					created_at: new Date(),
					updated_at: new Date(),
				},
			]

			await queryInterface.bulkInsert('permissions', permissionsData)

			//create role permission mapping
			const rolePermissionsData = [
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId('tenant', ['POST', 'GET'], '/user/v1/tenant/*'),
					module: 'tenant',
					request_type: ['POST', 'GET'],
					api_path: '/user/v1/tenant/*',
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
			api_path: '/user/v1/tenant/*',
			role_title: common.ADMIN_ROLE,
			permission_id: await getPermissionId('tenant', ['POST', 'GET'], '/user/v1/tenant/*'),
		})
		await queryInterface.bulkDelete('permissions', {
			id: await getPermissionId('tenant', ['POST', 'GET'], '/user/v1/tenant/*'),
		})

		await queryInterface.bulkDelete('modules', {
			code: 'tenant',
		})
	},
}
