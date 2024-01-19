'use strict'

require('module-alias/register')
const userRequests = require('@requests/user')
require('dotenv').config()
const common = require('@constants/common')
const Permissions = require('@database/models/index').Permission

let matchingResults = {}

const getRoleIds = async () => {
	try {
		const response = await userRequests.getListOfUserRoles(
			common.pagination.DEFAULT_PAGE_NO,
			common.pagination.DEFAULT_PAGE_SIZE,
			common.SEARCH
		)
		const allRoles = response.result.data
		if (!allRoles || !Array.isArray(allRoles)) {
			throw new Error('No roles found.')
		}
		const roleIds = allRoles.map((role) => role.id)
		const titles = [common.SESSION_MANAGER_ROLE, common.ADMIN_ROLE, common.MENTOR_ROLE]
		await Promise.all(
			titles.map(async (title) => {
				const matchingRole = allRoles.find((role) => role.title === title)
				if (matchingRole) {
					matchingResults[title] = matchingRole
				} else {
					throw new Error(`Role with title ${title} not found.`)
				}
			})
		)
		return matchingResults
	} catch (error) {
		throw error
	}
}

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
			await getRoleIds()

			const rolePermissionsData = [
				{
					role_id: matchingResults[common.SESSION_MANAGER_ROLE].id,
					permission_id: await getPermissionId('mentees', ['GET'], '/mentoring/v1/mentees/list'),
					module: 'mentees',
					request_type: ['GET'],
					api_path: '/mentoring/v1/mentees/list',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.SESSION_MANAGER_ROLE].id,
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
					role_id: matchingResults[common.SESSION_MANAGER_ROLE].id,
					permission_id: await getPermissionId('profile', ['GET'], '/mentoring/v1/profile/filterList'),
					module: 'profile',
					request_type: ['GET'],
					api_path: '/mentoring/v1/profile/filterList',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.SESSION_MANAGER_ROLE].id,
					permission_id: await getPermissionId('sessions', ['POST'], '/mentoring/v1/sessions/addMentees'),
					module: 'sessions',
					request_type: ['POST'],
					api_path: '/mentoring/v1/sessions/addMentees',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.SESSION_MANAGER_ROLE].id,
					permission_id: await getPermissionId(
						'manage_session',
						['POST'],
						'/mentoring/v1/manage-sessions/downloadSessions'
					),
					module: 'manage_session',
					request_type: ['POST'],
					api_path: '/mentoring/v1/manage-sessions/downloadSessions',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.SESSION_MANAGER_ROLE].id,
					permission_id: await getPermissionId(
						'manage_session',
						['POST'],
						'/mentoring/v1/manage-sessions/createdSessions'
					),
					module: 'manage_session',
					request_type: ['POST'],
					api_path: '/mentoring/v1/manage-sessions/createdSessions',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.SESSION_MANAGER_ROLE].id,
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
					role_id: matchingResults[common.MENTOR_ROLE].id,
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
					role_id: matchingResults[common.MENTOR_ROLE].id,
					permission_id: await getPermissionId('sessions', ['POST'], '/mentoring/v1/sessions/addMentees'),
					module: 'sessions',
					request_type: ['POST'],
					api_path: '/mentoring/v1/sessions/addMentees',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.MENTOR_ROLE].id,
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
					role_id: matchingResults[common.ADMIN_ROLE].id,
					permission_id: await getPermissionId('permissions', ['GET'], '/mentoring/v1/permissions/list'),
					module: 'permissions',
					request_type: ['GET'],
					api_path: '/mentoring/v1/permissions/list',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.ADMIN_ROLE].id,
					permission_id: await getPermissionId('modules', ['GET'], '/mentoring/v1/modules/list'),
					module: 'modules',
					request_type: ['GET'],
					api_path: '/mentoring/v1/modules/list',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.ADMIN_ROLE].id,
					permission_id: await getPermissionId('permissions', ['POST'], '/mentoring/v1/permissions/create'),
					module: 'permissions',
					request_type: ['POST'],
					api_path: '/mentoring/v1/permissions/create',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.ADMIN_ROLE].id,
					permission_id: await getPermissionId('modules', ['POST'], '/mentoring/v1/modules/create'),
					module: 'modules',
					request_type: ['POST'],
					api_path: '/mentoring/v1/modules/create',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.ADMIN_ROLE].id,
					permission_id: await getPermissionId(
						'role_permission_mapping',
						['POST'],
						'/mentoring/v1/rolePermissionMapping/create/:role_id'
					),
					module: 'role_permission_mapping',
					request_type: ['POST'],
					api_path: '/mentoring/v1/rolePermissionMapping/create/:role_id',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.ADMIN_ROLE].id,
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
					role_id: matchingResults[common.ADMIN_ROLE].id,
					permission_id: await getPermissionId('modules', ['POST'], '/mentoring/v1/modules/update/:id'),
					module: 'modules',
					request_type: ['POST'],
					api_path: '/mentoring/v1/modules/update/:id',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.ADMIN_ROLE].id,
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
					role_id: matchingResults[common.ADMIN_ROLE].id,
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
