'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		try {
			const permissionsData = [
				//Users API's
				{
					code: 'user_read_update',
					module: 'user',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/user/*',
					status: 'ACTIVE',
				},
				{
					code: 'user_share',
					module: 'user',
					request_type: ['GET'],
					api_path: '/user/v1/user/share*',
					status: 'ACTIVE',
				},
				{
					code: 'user_role_default_list_permissions',
					module: 'user-role',
					request_type: ['GET'],
					api_path: '/user/v1/user-role/default',
					status: 'ACTIVE',
				},
				{
					code: 'user_role_permissions',
					module: 'user-role',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/user-role/*',
					status: 'ACTIVE',
				},
				{
					code: 'form_permissions',
					module: 'form',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/form/*',
					status: 'ACTIVE',
				},
				{
					code: 'read_form_permissions',
					module: 'form',
					request_type: ['POST'],
					api_path: '/user/v1/form/read*',
					status: 'ACTIVE',
				},
				{
					code: 'cloud_service_permissions',
					module: 'cloud-services',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/cloud-services/*',
					status: 'ACTIVE',
				},
				{
					code: 'create_organization',
					module: 'organization',
					request_type: ['POST'],
					api_path: '/user/v1/organization/create',
					status: 'ACTIVE',
				},
				{
					code: 'update_organization',
					module: 'organization',
					request_type: ['POST'],
					api_path: '/user/v1/organization/update*',
					status: 'ACTIVE',
				},
				{
					code: 'request_organization_role',
					module: 'organization',
					request_type: ['POST'],
					api_path: '/user/v1/organization/requestOrgRole',
					status: 'ACTIVE',
				},
				{
					code: 'read_list_organization',
					module: 'organization',
					request_type: ['GET'],
					api_path: '/user/v1/organization/*',
					status: 'ACTIVE',
				},
				{
					code: 'entity_type_permissions',
					module: 'entity-type',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/entity-type/*',
					status: 'ACTIVE',
				},
				{
					code: 'read_entity_type',
					module: 'entity-type',
					request_type: ['POST'],
					api_path: '/user/v1/entity-type/read',
					status: 'ACTIVE',
				},
				{
					code: 'entity_permissions',
					module: 'entity',
					request_type: ['POST', 'DELETE', 'PUT', 'PATCH'],
					api_path: '/user/v1/entity/*',
					status: 'ACTIVE',
				},
				{
					code: 'read_entity',
					module: 'entity',
					request_type: ['GET'],
					api_path: '/user/v1/entity/read*',
					status: 'ACTIVE',
				},
				{
					code: 'org_admin_permissions',
					module: 'org-admin',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/org-admin/*',
					status: 'ACTIVE',
				},
				{
					code: 'notification_permissions',
					module: 'notification',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/notification/*',
					status: 'ACTIVE',
				},
				{
					code: 'account_permissions',
					module: 'account',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/account/*',
					status: 'ACTIVE',
				},
				{
					code: 'logout_account_permissions',
					module: 'account',
					request_type: ['POST'],
					api_path: '/user/v1/account/logout',
					status: 'ACTIVE',
				},
				{
					code: 'list_account_permissions',
					module: 'account',
					request_type: ['GET'],
					api_path: '/user/v1/account/list',
					status: 'ACTIVE',
				},
				{
					code: 'search_account_permissions',
					module: 'account',
					request_type: ['POST'],
					api_path: '/user/v1/account/search',
					status: 'ACTIVE',
				},
				{
					code: 'delete_admin',
					module: 'admin',
					request_type: ['DELETE'],
					api_path: '/user/v1/admin/delete*',
					status: 'ACTIVE',
				},
				{
					code: 'deactivate_org_by_id',
					module: 'admin',
					request_type: ['POST'],
					api_path: '/user/v1/admin/deactivateOrg/:id',
					status: 'ACTIVE',
				},
				{
					code: 'create_admin_permissions',
					module: 'admin',
					request_type: ['POST'],
					api_path: '/user/v1/admin/create',
					status: 'ACTIVE',
				},
				{
					code: 'login_admin_permissions',
					module: 'admin',
					request_type: ['POST'],
					api_path: '/user/v1/admin/login',
					status: 'ACTIVE',
				},
				{
					code: 'addorgadmin_permissions',
					module: 'admin',
					request_type: ['POST'],
					api_path: '/user/v1/admin/addOrgAdmin',
					status: 'ACTIVE',
				},
				{
					code: 'list_user_role_permissions',
					module: 'user-role',
					request_type: ['GET'],
					api_path: '/user/v1/user-role/list',
					status: 'ACTIVE',
				},
			]

			// Batch insert permissions
			await queryInterface.bulkInsert(
				'permissions',
				permissionsData.map((permission) => ({
					...permission,
					created_at: new Date(),
					updated_at: new Date(),
				}))
			)
		} catch (error) {
			console.error('Error in migration:', error)
			throw error
		}
	},

	async down(queryInterface, Sequelize) {
		try {
			// Rollback migration by deleting all permissions
			await queryInterface.bulkDelete('permissions', null, {})
		} catch (error) {
			console.error('Error in rollback migration:', error)
			throw error
		}
	},
}
