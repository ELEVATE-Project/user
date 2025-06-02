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
			const modulesData = [
				{ code: 'organization-feature', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			]

			// Insert the data into the 'modules' table
			await queryInterface.bulkInsert('modules', modulesData)

			const permissionsData = [
				{
					code: 'organization_feature_crud',
					module: 'organization-feature',
					request_type: ['POST', 'GET'],
					api_path: '/user/v1/organization-feature/*',
					status: 'ACTIVE',
					created_at: new Date(),
					updated_at: new Date(),
				},
				{
					code: 'organization_feature_public',
					module: 'organization-feature',
					request_type: ['GET'],
					api_path: '/user/v1/organization-feature/read*',
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
						'organization-feature',
						['POST', 'GET'],
						'/user/v1/organization-feature/*'
					),
					module: 'organization-feature',
					request_type: ['POST', 'GET'],
					api_path: '/user/v1/organization-feature/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId(
						'organization-feature',
						['POST', 'GET'],
						'/user/v1/organization-feature/*'
					),
					module: 'organization-feature',
					request_type: ['POST', 'GET'],
					api_path: '/user/v1/organization-feature/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.PUBLIC_ROLE,
					permission_id: await getPermissionId(
						'organization-feature',
						['GET'],
						'/user/v1/organization-feature/read*'
					),
					module: 'organization-feature',
					request_type: ['GET'],
					api_path: '/user/v1/organization-feature/read*',
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
			api_path: '/user/v1/organization-feature/*',
			role_title: common.ADMIN_ROLE,
			permission_id: await getPermissionId(
				'organization-feature',
				['POST', 'GET'],
				'/user/v1/organization-feature/*'
			),
		})

		await queryInterface.bulkDelete('role_permission_mapping', {
			api_path: '/user/v1/organization-feature/*',
			role_title: common.ORG_ADMIN_ROLE,
			permission_id: await getPermissionId(
				'organization-feature',
				['POST', 'GET'],
				'/user/v1/organization-feature/*'
			),
		})

		await queryInterface.bulkDelete('role_permission_mapping', {
			role_title: common.PUBLIC_ROLE,
			permission_id: await getPermissionId(
				'organization-feature',
				['GET'],
				'/user/v1/organization-feature/read*'
			),
			api_path: '/user/v1/organization-feature/read*',
		})

		await queryInterface.bulkDelete('permissions', {
			id: await getPermissionId('organization-feature', ['POST', 'GET'], '/user/v1/organization-feature/*'),
		})

		await queryInterface.bulkDelete('permissions', {
			id: await getPermissionId('organization-feature', ['GET'], '/user/v1/organization-feature/read/*'),
		})

		await queryInterface.bulkDelete('modules', {
			code: 'organization-feature',
		})
	},
}
