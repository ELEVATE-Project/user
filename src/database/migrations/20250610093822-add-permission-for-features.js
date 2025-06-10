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
		console.log('permission', permission.id)
		return permission.id
	} catch (error) {
		throw error
	}
}

module.exports = {
	up: async (queryInterface, Sequelize) => {
		try {
			//create module
			const modulesData = [{ code: 'feature', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() }]

			// Insert the data into the 'modules' table
			await queryInterface.bulkInsert('modules', modulesData)

			const permissionsData = [
				{
					code: 'feature_crud',
					module: 'feature',
					request_type: ['POST', 'GET', 'DELETE', 'PATCH'],
					api_path: '/user/v1/feature/*',
					status: 'ACTIVE',
					created_at: new Date(),
					updated_at: new Date(),
				},
				{
					code: 'feature_read',
					module: 'feature',
					request_type: ['GET'],
					api_path: '/user/v1/feature/list*',
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
					permission_id: await getPermissionId(
						'feature',
						['POST', 'GET', 'DELETE', 'PATCH'],
						'/user/v1/feature/*'
					),
					module: 'feature',
					request_type: ['POST', 'GET', 'DELETE', 'PATCH'],
					api_path: '/user/v1/feature/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId(
						'feature',
						['POST', 'GET', 'DELETE', 'PATCH'],
						'/user/v1/feature/*'
					),
					module: 'feature',
					request_type: ['POST', 'GET', 'DELETE', 'PATCH'],
					api_path: '/user/v1/feature/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.PUBLIC_ROLE,
					permission_id: await getPermissionId('feature', ['GET'], '/user/v1/feature/list*'),
					module: 'feature',
					request_type: ['GET'],
					api_path: '/user/v1/feature/list*',
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
			api_path: '/user/v1/feature/*',
			role_title: common.ADMIN_ROLE,
			permission_id: await getPermissionId('feature', ['POST', 'GET', 'DELETE', 'PATCH'], '/user/v1/feature/*'),
		})

		await queryInterface.bulkDelete('role_permission_mapping', {
			api_path: '/user/v1/feature/*',
			role_title: common.ORG_ADMIN_ROLE,
			permission_id: await getPermissionId('feature', ['POST', 'GET', 'DELETE', 'PATCH'], '/user/v1/feature/*'),
		})

		await queryInterface.bulkDelete('role_permission_mapping', {
			role_title: common.PUBLIC_ROLE,
			permission_id: await getPermissionId('feature', ['GET'], '/user/v1/feature/list*'),
			api_path: '/user/v1/feature/list*',
		})

		await queryInterface.bulkDelete('permissions', {
			id: await getPermissionId('feature', ['POST', 'GET', 'DELETE', 'PATCH'], '/user/v1/feature/*'),
		})

		await queryInterface.bulkDelete('permissions', {
			id: await getPermissionId('feature', ['GET'], '/user/v1/feature/list*'),
		})

		await queryInterface.bulkDelete('modules', {
			code: 'feature',
		})
	},
}
