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
		await queryInterface.bulkDelete('role_permission_mapping', null, {})
		try {
			const rolePermissionsData = [
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId(
						'admin',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/admin/*'
					),
					module: 'admin',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/admin/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.MENTOR_ROLE,
					permission_id: await getPermissionId(
						'cloud-services',
						['POST', 'GET'],
						'/mentoring/v1/cloud-services/getSignedUrl'
					),
					module: 'cloud-services',
					request_type: ['POST', 'GET'],
					api_path: '/mentoring/v1/cloud-services/getSignedUrl',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.MENTEE_ROLE,
					permission_id: await getPermissionId(
						'cloud-services',
						['POST', 'GET'],
						'/mentoring/v1/cloud-services/getSignedUrl'
					),
					module: 'cloud-services',
					request_type: ['POST', 'GET'],
					api_path: '/mentoring/v1/cloud-services/getSignedUrl',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId(
						'cloud-services',
						['POST', 'GET'],
						'/mentoring/v1/cloud-services/getSignedUrl'
					),
					module: 'cloud-services',
					request_type: ['POST', 'GET'],
					api_path: '/mentoring/v1/cloud-services/getSignedUrl',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.USER_ROLE,
					permission_id: await getPermissionId(
						'cloud-services',
						['POST', 'GET'],
						'/mentoring/v1/cloud-services/getSignedUrl'
					),
					module: 'cloud-services',
					request_type: ['POST', 'GET'],
					api_path: '/mentoring/v1/cloud-services/getSignedUrl',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId(
						'cloud-services',
						['POST', 'GET'],
						'/mentoring/v1/cloud-services/getSignedUrl'
					),
					module: 'cloud-services',
					request_type: ['POST', 'GET'],
					api_path: '/mentoring/v1/cloud-services/getSignedUrl',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.SESSION_MANAGER_ROLE,
					permission_id: await getPermissionId(
						'cloud-services',
						['POST', 'GET'],
						'/mentoring/v1/cloud-services/getSignedUrl'
					),
					module: 'cloud-services',
					request_type: ['POST', 'GET'],
					api_path: '/mentoring/v1/cloud-services/getSignedUrl',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},

				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId(
						'entity-type',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/entity-type/*'
					),
					module: 'entity-type',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/entity-type/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},

				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId(
						'entity-type',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/entity-type/*'
					),
					module: 'entity-type',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/entity-type/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.MENTOR_ROLE,
					permission_id: await getPermissionId('entity-type', ['POST'], '/mentoring/v1/entity-type/read'),
					module: 'entity-type',
					request_type: ['POST'],
					api_path: '/mentoring/v1/entity-type/read',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.MENTEE_ROLE,
					permission_id: await getPermissionId('entity-type', ['POST'], '/mentoring/v1/entity-type/read'),
					module: 'entity-type',
					request_type: ['POST'],
					api_path: '/mentoring/v1/entity-type/read',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId('entity-type', ['POST'], '/mentoring/v1/entity-type/read'),
					module: 'entity-type',
					request_type: ['POST'],
					api_path: '/mentoring/v1/entity-type/read',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.USER_ROLE,
					permission_id: await getPermissionId('entity-type', ['POST'], '/mentoring/v1/entity-type/read'),
					module: 'entity-type',
					request_type: ['POST'],
					api_path: '/mentoring/v1/entity-type/read',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId('entity-type', ['POST'], '/mentoring/v1/entity-type/read'),
					module: 'entity-type',
					request_type: ['POST'],
					api_path: '/mentoring/v1/entity-type/read',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.SESSION_MANAGER_ROLE,
					permission_id: await getPermissionId('entity-type', ['POST'], '/mentoring/v1/entity-type/read'),
					module: 'entity-type',
					request_type: ['POST'],
					api_path: '/mentoring/v1/entity-type/read',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId(
						'entity',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/entity/*'
					),
					module: 'entity',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/entity/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},

				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId(
						'entity',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/entity/*'
					),
					module: 'entity',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/entity/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.MENTOR_ROLE,
					permission_id: await getPermissionId('entity', ['POST'], '/mentoring/v1/entity/read'),
					module: 'entity',
					request_type: ['POST'],
					api_path: '/mentoring/v1/entity/read',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.MENTEE_ROLE,
					permission_id: await getPermissionId('entity', ['POST'], '/mentoring/v1/entity/read'),
					module: 'entity',
					request_type: ['POST'],
					api_path: '/mentoring/v1/entity/read',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId('entity', ['POST'], '/mentoring/v1/entity/read'),
					module: 'entity',
					request_type: ['POST'],
					api_path: '/mentoring/v1/entity/read',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.USER_ROLE,
					permission_id: await getPermissionId('entity', ['POST'], '/mentoring/v1/entity/read'),
					module: 'entity',
					request_type: ['POST'],
					api_path: '/mentoring/v1/entity/read',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId('entity', ['POST'], '/mentoring/v1/entity/read'),
					module: 'entity',
					request_type: ['POST'],
					api_path: '/mentoring/v1/entity/read',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.SESSION_MANAGER_ROLE,
					permission_id: await getPermissionId('entity', ['POST'], '/mentoring/v1/entity/read'),
					module: 'entity',
					request_type: ['POST'],
					api_path: '/mentoring/v1/entity/read',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.MENTOR_ROLE,
					permission_id: await getPermissionId(
						'feedback',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/feedback/*'
					),
					module: 'feedback',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/feedback/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.MENTEE_ROLE,
					permission_id: await getPermissionId(
						'feedback',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/feedback/*'
					),
					module: 'feedback',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/feedback/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId(
						'feedback',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/feedback/*'
					),
					module: 'feedback',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/feedback/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.USER_ROLE,
					permission_id: await getPermissionId(
						'feedback',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/feedback/*'
					),
					module: 'feedback',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/feedback/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId(
						'feedback',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/feedback/*'
					),
					module: 'feedback',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/feedback/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.SESSION_MANAGER_ROLE,
					permission_id: await getPermissionId(
						'feedback',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/feedback/*'
					),
					module: 'feedback',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/feedback/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId(
						'form',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/form/*'
					),
					module: 'form',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/form/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},

				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId(
						'form',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/form/*'
					),
					module: 'form',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/form/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.MENTOR_ROLE,
					permission_id: await getPermissionId('form', ['POST'], '/mentoring/v1/form/read*'),
					module: 'form',
					request_type: ['POST'],
					api_path: '/mentoring/v1/form/read*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.MENTEE_ROLE,
					permission_id: await getPermissionId('form', ['POST'], '/mentoring/v1/form/read*'),
					module: 'form',
					request_type: ['POST'],
					api_path: '/mentoring/v1/form/read*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId('form', ['POST'], '/mentoring/v1/form/read*'),
					module: 'form',
					request_type: ['POST'],
					api_path: '/mentoring/v1/form/read*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.USER_ROLE,
					permission_id: await getPermissionId('form', ['POST'], '/mentoring/v1/form/read*'),
					module: 'form',
					request_type: ['POST'],
					api_path: '/mentoring/v1/form/read*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId('form', ['POST'], '/mentoring/v1/form/read*'),
					module: 'form',
					request_type: ['POST'],
					api_path: '/mentoring/v1/form/read*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.SESSION_MANAGER_ROLE,
					permission_id: await getPermissionId('form', ['POST'], '/mentoring/v1/form/read*'),
					module: 'form',
					request_type: ['POST'],
					api_path: '/mentoring/v1/form/read*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.MENTOR_ROLE,
					permission_id: await getPermissionId('issues', ['POST'], '/mentoring/v1/issues/create'),
					module: 'issues',
					request_type: ['POST'],
					api_path: '/mentoring/v1/issues/create',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.MENTEE_ROLE,
					permission_id: await getPermissionId('issues', ['POST'], '/mentoring/v1/issues/create'),
					module: 'issues',
					request_type: ['POST'],
					api_path: '/mentoring/v1/issues/create',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId('issues', ['POST'], '/mentoring/v1/issues/create'),
					module: 'issues',
					request_type: ['POST'],
					api_path: '/mentoring/v1/issues/create',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.USER_ROLE,
					permission_id: await getPermissionId('issues', ['POST'], '/mentoring/v1/issues/create'),
					module: 'issues',
					request_type: ['POST'],
					api_path: '/mentoring/v1/issues/create',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId('issues', ['POST'], '/mentoring/v1/issues/create'),
					module: 'issues',
					request_type: ['POST'],
					api_path: '/mentoring/v1/issues/create',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.SESSION_MANAGER_ROLE,
					permission_id: await getPermissionId('issues', ['POST'], '/mentoring/v1/issues/create'),
					module: 'issues',
					request_type: ['POST'],
					api_path: '/mentoring/v1/issues/create',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.MENTOR_ROLE,
					permission_id: await getPermissionId(
						'mentees',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/mentees/*'
					),
					module: 'mentees',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/mentees/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.MENTEE_ROLE,
					permission_id: await getPermissionId(
						'mentees',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/mentees/*'
					),
					module: 'mentees',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/mentees/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId(
						'mentees',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/mentees/*'
					),
					module: 'mentees',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/mentees/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.USER_ROLE,
					permission_id: await getPermissionId(
						'mentees',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/mentees/*'
					),
					module: 'mentees',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/mentees/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId(
						'mentees',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/mentees/*'
					),
					module: 'mentees',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/mentees/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.SESSION_MANAGER_ROLE,
					permission_id: await getPermissionId(
						'mentees',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/mentees/*'
					),
					module: 'mentees',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/mentees/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.MENTOR_ROLE,
					permission_id: await getPermissionId(
						'mentors',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/mentors/create'
					),
					module: 'mentors',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/mentors/create',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.MENTOR_ROLE,
					permission_id: await getPermissionId(
						'mentors',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/mentors/createdSessions'
					),
					module: 'mentors',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/mentors/createdSessions',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId(
						'mentors',
						['POST', 'DELETE'],
						'/mentoring/v1/mentors/deleteMentorExtension'
					),
					module: 'mentors',
					request_type: ['POST', 'DELETE'],
					api_path: '/mentoring/v1/mentors/deleteMentorExtension',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.MENTOR_ROLE,
					permission_id: await getPermissionId('mentors', ['GET'], '/mentoring/v1/mentors/reports'),
					module: 'mentors',
					request_type: ['GET'],
					api_path: '/mentoring/v1/mentors/reports',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.MENTOR_ROLE,
					permission_id: await getPermissionId(
						'mentors',
						['POST', 'PUT', 'PATCH'],
						'/mentoring/v1/mentors/update'
					),
					module: 'mentors',
					request_type: ['POST', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/mentors/update',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.MENTOR_ROLE,
					permission_id: await getPermissionId(
						'mentors',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/mentors/*'
					),
					module: 'mentors',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/mentors/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.MENTEE_ROLE,
					permission_id: await getPermissionId(
						'mentors',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/mentors/*'
					),
					module: 'mentors',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/mentors/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId(
						'mentors',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/mentors/*'
					),
					module: 'mentors',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/mentors/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.USER_ROLE,
					permission_id: await getPermissionId(
						'mentors',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/mentors/*'
					),
					module: 'mentors',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/mentors/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId(
						'mentors',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/mentors/*'
					),
					module: 'mentors',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/mentors/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.SESSION_MANAGER_ROLE,
					permission_id: await getPermissionId(
						'mentors',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/mentors/*'
					),
					module: 'mentors',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/mentors/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId(
						'notification',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/notification/template*'
					),
					module: 'notification',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/notification/template*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},

				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId(
						'notification',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/notification/template*'
					),
					module: 'notification',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/notification/template*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId(
						'org-admin',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/org-admin/*'
					),
					module: 'org-admin',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/org-admin/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},

				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId(
						'org-admin',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/org-admin/*'
					),
					module: 'org-admin',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/org-admin/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId(
						'organization',
						['POST', 'PUT', 'PATCH'],
						'/mentoring/v1/organization/update'
					),
					module: 'organization',
					request_type: ['POST', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/organization/update',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.PUBLIC_ROLE,
					permission_id: await getPermissionId('platform', ['GET'], '/mentoring/v1/platform/config'),
					module: 'platform',
					request_type: ['GET'],
					api_path: '/mentoring/v1/platform/config',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.MENTOR_ROLE,
					permission_id: await getPermissionId(
						'profile',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/profile/*'
					),
					module: 'profile',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/profile/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.MENTEE_ROLE,
					permission_id: await getPermissionId(
						'profile',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/profile/*'
					),
					module: 'profile',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/profile/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId(
						'profile',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/profile/*'
					),
					module: 'profile',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/profile/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.USER_ROLE,
					permission_id: await getPermissionId(
						'profile',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/profile/*'
					),
					module: 'profile',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/profile/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId(
						'profile',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/profile/*'
					),
					module: 'profile',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/profile/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.SESSION_MANAGER_ROLE,
					permission_id: await getPermissionId(
						'profile',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/profile/*'
					),
					module: 'profile',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/profile/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId(
						'question-set',
						['POST', 'PUT', 'PATCH'],
						'/mentoring/v1/question-set/*'
					),
					module: 'question-set',
					request_type: ['POST', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/question-set/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},

				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId(
						'questions',
						['POST', 'PUT', 'PATCH'],
						'/mentoring/v1/questions/*'
					),
					module: 'questions',
					request_type: ['POST', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/questions/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId(
						'questions',
						['POST', 'PUT', 'PATCH'],
						'/mentoring/v1/questions/*'
					),
					module: 'questions',
					request_type: ['POST', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/questions/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},

				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId(
						'question-set',
						['POST', 'PUT', 'PATCH'],
						'/mentoring/v1/question-set/*'
					),
					module: 'question-set',
					request_type: ['POST', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/question-set/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.MENTOR_ROLE,
					permission_id: await getPermissionId('questions', ['GET'], '/mentoring/v1/questions/read*'),
					module: 'questions',
					request_type: ['GET'],
					api_path: '/mentoring/v1/questions/read*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.MENTEE_ROLE,
					permission_id: await getPermissionId('questions', ['GET'], '/mentoring/v1/questions/read*'),
					module: 'questions',
					request_type: ['GET'],
					api_path: '/mentoring/v1/questions/read*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId('questions', ['GET'], '/mentoring/v1/questions/read*'),
					module: 'questions',
					request_type: ['GET'],
					api_path: '/mentoring/v1/questions/read*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.USER_ROLE,
					permission_id: await getPermissionId('questions', ['GET'], '/mentoring/v1/questions/read*'),
					module: 'questions',
					request_type: ['GET'],
					api_path: '/mentoring/v1/questions/read*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId('questions', ['GET'], '/mentoring/v1/questions/read*'),
					module: 'questions',
					request_type: ['GET'],
					api_path: '/mentoring/v1/questions/read*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.SESSION_MANAGER_ROLE,
					permission_id: await getPermissionId('questions', ['GET'], '/mentoring/v1/questions/read*'),
					module: 'questions',
					request_type: ['GET'],
					api_path: '/mentoring/v1/questions/read*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.MENTOR_ROLE,
					permission_id: await getPermissionId('question-set', ['POST'], '/mentoring/v1/question-set/read*'),
					module: 'question-set',
					request_type: ['POST'],
					api_path: '/mentoring/v1/question-set/read*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.MENTEE_ROLE,
					permission_id: await getPermissionId('question-set', ['POST'], '/mentoring/v1/question-set/read*'),
					module: 'question-set',
					request_type: ['POST'],
					api_path: '/mentoring/v1/question-set/read*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId('question-set', ['POST'], '/mentoring/v1/question-set/read*'),
					module: 'question-set',
					request_type: ['POST'],
					api_path: '/mentoring/v1/question-set/read*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.USER_ROLE,
					permission_id: await getPermissionId('question-set', ['POST'], '/mentoring/v1/question-set/read*'),
					module: 'question-set',
					request_type: ['POST'],
					api_path: '/mentoring/v1/question-set/read*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId('question-set', ['POST'], '/mentoring/v1/question-set/read*'),
					module: 'question-set',
					request_type: ['POST'],
					api_path: '/mentoring/v1/question-set/read*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.SESSION_MANAGER_ROLE,
					permission_id: await getPermissionId('question-set', ['POST'], '/mentoring/v1/question-set/read*'),
					module: 'question-set',
					request_type: ['POST'],
					api_path: '/mentoring/v1/question-set/read*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.PUBLIC_ROLE,
					permission_id: await getPermissionId(
						'sessions',
						['PATCH', 'GET'],
						'/mentoring/v1/sessions/completed*'
					),
					module: 'sessions',
					request_type: ['PATCH', 'GET'],
					api_path: '/mentoring/v1/sessions/completed*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.MENTOR_ROLE,
					permission_id: await getPermissionId(
						'sessions',
						['GET'],
						'/mentoring/v1/sessions/enrolledMentees*'
					),
					module: 'sessions',
					request_type: ['GET'],
					api_path: '/mentoring/v1/sessions/enrolledMentees*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.SESSION_MANAGER_ROLE,
					permission_id: await getPermissionId(
						'sessions',
						['GET'],
						'/mentoring/v1/sessions/enrolledMentees*'
					),
					module: 'sessions',
					request_type: ['GET'],
					api_path: '/mentoring/v1/sessions/enrolledMentees*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.MENTOR_ROLE,
					permission_id: await getPermissionId('sessions', ['POST'], '/mentoring/v1/sessions/start*'),
					module: 'sessions',
					request_type: ['POST'],
					api_path: '/mentoring/v1/sessions/start*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.SESSION_MANAGER_ROLE,
					permission_id: await getPermissionId('sessions', ['POST'], '/mentoring/v1/sessions/start*'),
					module: 'sessions',
					request_type: ['POST'],
					api_path: '/mentoring/v1/sessions/start*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.MENTOR_ROLE,
					permission_id: await getPermissionId('sessions', ['POST'], '/mentoring/v1/sessions/update*'),
					module: 'sessions',
					request_type: ['POST'],
					api_path: '/mentoring/v1/sessions/update*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.SESSION_MANAGER_ROLE,
					permission_id: await getPermissionId('sessions', ['POST'], '/mentoring/v1/sessions/update*'),
					module: 'sessions',
					request_type: ['POST'],
					api_path: '/mentoring/v1/sessions/update*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.PUBLIC_ROLE,
					permission_id: await getPermissionId(
						'sessions',
						['POST'],
						'/mentoring/v1/sessions/updateRecordingUrl*'
					),
					module: 'sessions',
					request_type: ['POST'],
					api_path: '/mentoring/v1/sessions/updateRecordingUrl*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.MENTOR_ROLE,
					permission_id: await getPermissionId(
						'sessions',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/sessions/*'
					),
					module: 'sessions',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/sessions/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.MENTEE_ROLE,
					permission_id: await getPermissionId(
						'sessions',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/sessions/*'
					),
					module: 'sessions',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/sessions/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId(
						'sessions',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/sessions/*'
					),
					module: 'sessions',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/sessions/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.USER_ROLE,
					permission_id: await getPermissionId(
						'sessions',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/sessions/*'
					),
					module: 'sessions',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/sessions/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId(
						'sessions',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/sessions/*'
					),
					module: 'sessions',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/sessions/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.SESSION_MANAGER_ROLE,
					permission_id: await getPermissionId(
						'sessions',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/sessions/*'
					),
					module: 'sessions',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/sessions/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.MENTOR_ROLE,
					permission_id: await getPermissionId('users', ['GET'], '/mentoring/v1/users/*'),
					module: 'users',
					request_type: ['GET'],
					api_path: '/mentoring/v1/users/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.MENTEE_ROLE,
					permission_id: await getPermissionId('users', ['GET'], '/mentoring/v1/users/*'),
					module: 'users',
					request_type: ['GET'],
					api_path: '/mentoring/v1/users/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId('users', ['GET'], '/mentoring/v1/users/*'),
					module: 'users',
					request_type: ['GET'],
					api_path: '/mentoring/v1/users/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.USER_ROLE,
					permission_id: await getPermissionId('users', ['GET'], '/mentoring/v1/users/*'),
					module: 'users',
					request_type: ['GET'],
					api_path: '/mentoring/v1/users/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId('users', ['GET'], '/mentoring/v1/users/*'),
					module: 'users',
					request_type: ['GET'],
					api_path: '/mentoring/v1/users/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.SESSION_MANAGER_ROLE,
					permission_id: await getPermissionId('users', ['GET'], '/mentoring/v1/users/*'),
					module: 'users',
					request_type: ['GET'],
					api_path: '/mentoring/v1/users/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId(
						'permissions',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/permissions/*'
					),
					module: 'permissions',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/permissions/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId(
						'modules',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/modules/*'
					),
					module: 'modules',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/modules/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId(
						'role-permission-mapping',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/role-permission-mapping/*'
					),
					module: 'role-permission-mapping',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/role-permission-mapping/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.SESSION_MANAGER_ROLE,
					permission_id: await getPermissionId(
						'sessions',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/sessions/addMentees'
					),
					module: 'sessions',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/sessions/addMentees',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.MENTOR_ROLE,
					permission_id: await getPermissionId(
						'sessions',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/sessions/addMentees'
					),
					module: 'sessions',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/sessions/addMentees',
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
					permission_id: await getPermissionId(
						'manage-sessions',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/mentoring/v1/manage-sessions/*'
					),
					module: 'manage-sessions',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/mentoring/v1/manage-sessions/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
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
					role_title: common.MENTEE_ROLE,
					permission_id: await getPermissionId(
						'role-permission-mapping',
						['POST'],
						'/mentoring/v1/role-permission-mapping/list'
					),
					module: 'role-permission-mapping',
					request_type: ['POST'],
					api_path: '/mentoring/v1/role-permission-mapping/list',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.MENTOR_ROLE,
					permission_id: await getPermissionId(
						'role-permission-mapping',
						['POST'],
						'/mentoring/v1/role-permission-mapping/list'
					),
					module: 'role-permission-mapping',
					request_type: ['POST'],
					api_path: '/mentoring/v1/role-permission-mapping/list',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.USER_ROLE,
					permission_id: await getPermissionId(
						'role-permission-mapping',
						['POST'],
						'/mentoring/v1/role-permission-mapping/list'
					),
					module: 'role-permission-mapping',
					request_type: ['POST'],
					api_path: '/mentoring/v1/role-permission-mapping/list',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId(
						'role-permission-mapping',
						['POST'],
						'/mentoring/v1/role-permission-mapping/list'
					),
					module: 'role-permission-mapping',
					request_type: ['POST'],
					api_path: '/mentoring/v1/role-permission-mapping/list',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId(
						'role-permission-mapping',
						['POST'],
						'/mentoring/v1/role-permission-mapping/list'
					),
					module: 'role-permission-mapping',
					request_type: ['POST'],
					api_path: '/mentoring/v1/role-permission-mapping/list',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_title: common.SESSION_MANAGER_ROLE,
					permission_id: await getPermissionId(
						'role-permission-mapping',
						['POST'],
						'/mentoring/v1/role-permission-mapping/list'
					),
					module: 'role-permission-mapping',
					request_type: ['POST'],
					api_path: '/mentoring/v1/role-permission-mapping/list',
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
