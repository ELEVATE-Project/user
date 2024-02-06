'use strict'

require('module-alias/register')
const userRequests = require('@requests/user')
require('dotenv').config()
const common = require('@constants/common')
const Permissions = require('@database/models/index').Permission

const getPermissionId = async (module, request_type, api_path) => {
	try {
		const permission = await Permissions.findOne({
			where: { module, request_type, api_path },
		})
		if (!permission) {
			throw error
		}
		return permission.id
	} catch (error) {
		throw error
	}
}

module.exports = {
	up: async (queryInterface, Sequelize) => {
		try {
			const rolePermissionsData = [
				{
					role_title: common.SESSION_MANAGER_ROLE,
					permission_id: await getPermissionId('mentees', ['GET'], '/mentoring/v1/mentees/list'),
					module: 'mentees',
					request_type: ['GET'],
					api_path: '/mentoring/v1/mentees/list',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.SESSION_MANAGER_ROLE,
					permission_id: await getPermissionId(
						'sessions',
						['GET'],
						'/mentoring/v1/sessions/enrolledMentees/:id'
					),
					module: 'sessions',
					request_type: ['GET'],
					api_path: '/mentoring/v1/sessions/enrolledMentees/:id',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.SESSION_MANAGER_ROLE,
					permission_id: await getPermissionId('profile', ['GET'], '/mentoring/v1/profile/filterList'),
					module: 'profile',
					request_type: ['GET'],
					api_path: '/mentoring/v1/profile/filterList',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.SESSION_MANAGER_ROLE,
					permission_id: await getPermissionId('sessions', ['POST'], '/mentoring/v1/sessions/addMentees'),
					module: 'sessions',
					request_type: ['POST'],
					api_path: '/mentoring/v1/sessions/addMentees',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.SESSION_MANAGER_ROLE,
					permission_id: await getPermissionId(
						'manage_session',
						['GET'],
						'/mentoring/v1/manage-sessions/downloadSessions'
					),
					module: 'manage_session',
					request_type: ['GET'],
					api_path: '/mentoring/v1/manage-sessions/downloadSessions',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.SESSION_MANAGER_ROLE,
					permission_id: await getPermissionId(
						'manage_session',
						['GET'],
						'/mentoring/v1/manage-sessions/createdSessions'
					),
					module: 'manage_session',
					request_type: ['GET'],
					api_path: '/mentoring/v1/manage-sessions/createdSessions',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.SESSION_MANAGER_ROLE,
					permission_id: await getPermissionId(
						'sessions',
						['DELETE'],
						'/mentoring/v1/sessions/removeMentees'
					),
					module: 'sessions',
					request_type: ['DELETE'],
					api_path: '/mentoring/v1/sessions/removeMentees',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.MENTOR_ROLE,
					permission_id: await getPermissionId(
						'sessions',
						['GET'],
						'/mentoring/v1/sessions/enrolledMentees/:id'
					),
					module: 'sessions',
					request_type: ['GET'],
					api_path: '/mentoring/v1/sessions/enrolledMentees/:id',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.MENTOR_ROLE,
					permission_id: await getPermissionId('sessions', ['POST'], '/mentoring/v1/sessions/addMentees'),
					module: 'sessions',
					request_type: ['POST'],
					api_path: '/mentoring/v1/sessions/addMentees',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.MENTOR_ROLE,
					permission_id: await getPermissionId(
						'sessions',
						['DELETE'],
						'/mentoring/v1/sessions/removeMentees'
					),
					module: 'sessions',
					request_type: ['DELETE'],
					api_path: '/mentoring/v1/sessions/removeMentees',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId('permissions', ['GET'], '/mentoring/v1/permissions/list'),
					module: 'permissions',
					request_type: ['GET'],
					api_path: '/mentoring/v1/permissions/list',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId('modules', ['GET'], '/mentoring/v1/modules/list'),
					module: 'modules',
					request_type: ['GET'],
					api_path: '/mentoring/v1/modules/list',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId('permissions', ['POST'], '/mentoring/v1/permissions/create'),
					module: 'permissions',
					request_type: ['POST'],
					api_path: '/mentoring/v1/permissions/create',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId('modules', ['POST'], '/mentoring/v1/modules/create'),
					module: 'modules',
					request_type: ['POST'],
					api_path: '/mentoring/v1/modules/create',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId(
						'permissions',
						['POST'],
						'/mentoring/v1/permissions/update/:id'
					),
					module: 'permissions',
					request_type: ['POST'],
					api_path: '/mentoring/v1/permissions/update/:id',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId('modules', ['POST'], '/mentoring/v1/modules/update/:id'),
					module: 'modules',
					request_type: ['POST'],
					api_path: '/mentoring/v1/modules/update/:id',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId(
						'permissions',
						['DELETE'],
						'/mentoring/v1/permissions/delete/:id'
					),
					module: 'permissions',
					request_type: ['DELETE'],
					api_path: '/mentoring/v1/permissions/delete/:id',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId('modules', ['DELETE'], '/mentoring/v1/modules/delete/:id'),
					module: 'modules',
					request_type: ['DELETE'],
					api_path: '/mentoring/v1/modules/delete/:id',
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
		await queryInterface.bulkDelete('role_permission_mapping', null, {})
	},
}
