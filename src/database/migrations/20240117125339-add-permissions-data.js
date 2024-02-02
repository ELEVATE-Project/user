'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		try {
			const permissionsData = [
				{
					code: 'read_mentees_list',
					module: 'mentees',
					request_type: ['GET'],
					api_path: '/mentoring/v1/mentees/list',
					status: 'ACTIVE',
					created_at: new Date(),
					updated_at: new Date(),
				},

				{
					code: 'read_permissions_list',
					module: 'permissions',
					request_type: ['GET'],
					api_path: '/mentoring/v1/permissions/list',
					status: 'ACTIVE',
					created_at: new Date(),
					updated_at: new Date(),
				},

				{
					code: 'read_modules_list',
					module: 'modules',
					request_type: ['GET'],
					api_path: '/mentoring/v1/modules/list',
					status: 'ACTIVE',
					created_at: new Date(),
					updated_at: new Date(),
				},

				{
					code: 'read_profile_list',
					module: 'profile',
					request_type: ['GET'],
					api_path: '/mentoring/v1/profile/filterList',
					status: 'ACTIVE',
					created_at: new Date(),
					updated_at: new Date(),
				},

				{
					code: 'read_enrolled_mentees_list',
					module: 'sessions',
					request_type: ['GET'],
					api_path: '/mentoring/v1/sessions/enrolledMentees/:id',
					status: 'ACTIVE',
					created_at: new Date(),
					updated_at: new Date(),
				},

				{
					code: 'write_session_addMentees',
					module: 'sessions',
					request_type: ['POST'],
					api_path: '/mentoring/v1/sessions/addMentees',
					status: 'ACTIVE',
					created_at: new Date(),
					updated_at: new Date(),
				},

				{
					code: 'write_permissions',
					module: 'permissions',
					request_type: ['POST'],
					api_path: '/mentoring/v1/permissions/create',
					status: 'ACTIVE',
					created_at: new Date(),
					updated_at: new Date(),
				},

				{
					code: 'write_modules',
					module: 'modules',
					request_type: ['POST'],
					api_path: '/mentoring/v1/modules/create',
					status: 'ACTIVE',
					created_at: new Date(),
					updated_at: new Date(),
				},

				{
					code: 'write_role_permission_mapping',
					module: 'role_permission_mapping',
					request_type: ['POST'],
					api_path: '/mentoring/v1/rolePermissionMapping/create/:role_id',
					status: 'ACTIVE',
					created_at: new Date(),
					updated_at: new Date(),
				},

				{
					code: 'update_permissions',
					module: 'permissions',
					request_type: ['POST'],
					api_path: '/mentoring/v1/permissions/update/:id',
					status: 'ACTIVE',
					created_at: new Date(),
					updated_at: new Date(),
				},

				{
					code: 'update_modules',
					module: 'modules',
					request_type: ['POST'],
					api_path: '/mentoring/v1/modules/update/:id',
					status: 'ACTIVE',
					created_at: new Date(),
					updated_at: new Date(),
				},

				{
					code: 'delete_remove_mentees',
					module: 'sessions',
					request_type: ['DELETE'],
					api_path: '/mentoring/v1/sessions/removeMentees',
					status: 'ACTIVE',
					created_at: new Date(),
					updated_at: new Date(),
				},

				{
					code: 'delete_permissions',
					module: 'permissions',
					request_type: ['DELETE'],
					api_path: '/mentoring/v1/permissions/delete/:id',
					status: 'ACTIVE',
					created_at: new Date(),
					updated_at: new Date(),
				},

				{
					code: 'delete_modules',
					module: 'modules',
					request_type: ['DELETE'],
					api_path: '/mentoring/v1/modules/delete/:id',
					status: 'ACTIVE',
					created_at: new Date(),
					updated_at: new Date(),
				},

				{
					code: 'delete_role_permission_mapping',
					module: 'role_permission_mapping',
					request_type: ['DELETE'],
					api_path: '/mentoring/v1/rolePermissionMapping/delete/:role_id',
					status: 'ACTIVE',
					created_at: new Date(),
					updated_at: new Date(),
				},

				{
					code: 'download_session',
					module: 'manage_session',
					request_type: ['GET'],
					api_path: '/mentoring/v1/manage-sessions/downloadSessions',
					status: 'ACTIVE',
					created_at: new Date(),
					updated_at: new Date(),
				},

				{
					code: 'created_session',
					module: 'manage_session',
					request_type: ['GET'],
					api_path: '/mentoring/v1/manage-sessions/createdSessions',
					status: 'ACTIVE',
					created_at: new Date(),
					updated_at: new Date(),
				},
			]
			await queryInterface.bulkInsert('permissions', permissionsData)
		} catch (error) {
			console.log(error)
		}
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('permissions', null, {})
	},
}
