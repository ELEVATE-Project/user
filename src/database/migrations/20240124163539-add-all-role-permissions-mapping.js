'use strict'

require('module-alias/register')
require('dotenv').config()
const common = require('@constants/common')
const Permissions = require('@database/models/index').Permission

const getPermissionId = async (module, request_type, api_path) => {
	try {
		const permission = await Permissions.findOne({
			where: { module, request_type, api_path },
		})
		if (!permission) {
			throw new Error(
				`Permission not found for module: ${module}, request_type: ${request_type}, api_path: ${api_path}`
			)
		}
		return permission.id
	} catch (error) {
		throw new Error(`Error while fetching permission: ${error.message}`)
	}
}

module.exports = {
	up: async (queryInterface, Sequelize) => {
		try {
			const rolePermissionsData = await Promise.all([
				{
					role_title: common.MENTOR_ROLE,
					permission_id: await getPermissionId(
						'user',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/user/*'
					),
					module: 'user',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/user/*',
				},
				{
					role_title: common.MENTEE_ROLE,
					permission_id: await getPermissionId(
						'user',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/user/*'
					),
					module: 'user',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/user/*',
				},
				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId(
						'user',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/user/*'
					),
					module: 'user',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/user/*',
				},
				{
					role_title: common.USER_ROLE,
					permission_id: await getPermissionId(
						'user',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/user/*'
					),
					module: 'user',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/user/*',
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId(
						'user',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/user/*'
					),
					module: 'user',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/user/*',
				},
				{
					role_title: common.SESSION_MANAGER_ROLE,
					permission_id: await getPermissionId(
						'user',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/user/*'
					),
					module: 'user',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/user/*',
				},
				{
					role_title: common.MENTOR_ROLE,
					permission_id: await getPermissionId('user', ['GET'], '/user/v1/user/share*'),
					module: 'user',
					request_type: ['GET'],
					api_path: '/user/v1/user/share*',
				},
				{
					role_title: common.PUBLIC_ROLE,
					permission_id: await getPermissionId('user-role', ['GET'], '/user/v1/user-role/default'),
					module: 'user-role',
					request_type: ['GET'],
					api_path: '/user/v1/user-role/default',
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId(
						'user-role',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/user-role/*'
					),
					module: 'user-role',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/user-role/*',
				},
				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId(
						'form',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/form/*'
					),
					module: 'form',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/form/*',
				},

				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId(
						'form',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/form/*'
					),
					module: 'form',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/form/*',
				},
				{
					role_title: common.MENTOR_ROLE,
					permission_id: await getPermissionId('form', ['POST'], '/user/v1/form/read*'),
					module: 'form',
					request_type: ['POST'],
					api_path: '/user/v1/form/read*',
				},
				{
					role_title: common.MENTEE_ROLE,
					permission_id: await getPermissionId('form', ['POST'], '/user/v1/form/read*'),
					module: 'form',
					request_type: ['POST'],
					api_path: '/user/v1/form/read*',
				},
				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId('form', ['POST'], '/user/v1/form/read*'),
					module: 'form',
					request_type: ['POST'],
					api_path: '/user/v1/form/read*',
				},
				{
					role_title: common.USER_ROLE,
					permission_id: await getPermissionId('form', ['POST'], '/user/v1/form/read*'),
					module: 'form',
					request_type: ['POST'],
					api_path: '/user/v1/form/read*',
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId('form', ['POST'], '/user/v1/form/read*'),
					module: 'form',
					request_type: ['POST'],
					api_path: '/user/v1/form/read*',
				},
				{
					role_title: common.SESSION_MANAGER_ROLE,
					permission_id: await getPermissionId('form', ['POST'], '/user/v1/form/read*'),
					module: 'form',
					request_type: ['POST'],
					api_path: '/user/v1/form/read*',
				},
				{
					role_title: common.MENTOR_ROLE,
					permission_id: await getPermissionId(
						'cloud-services',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/cloud-services/*'
					),
					module: 'cloud-services',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/cloud-services/*',
				},
				{
					role_title: common.MENTEE_ROLE,
					permission_id: await getPermissionId(
						'cloud-services',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/cloud-services/*'
					),
					module: 'cloud-services',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/cloud-services/*',
				},
				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId(
						'cloud-services',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/cloud-services/*'
					),
					module: 'cloud-services',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/cloud-services/*',
				},
				{
					role_title: common.USER_ROLE,
					permission_id: await getPermissionId(
						'cloud-services',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/cloud-services/*'
					),
					module: 'cloud-services',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/cloud-services/*',
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId(
						'cloud-services',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/cloud-services/*'
					),
					module: 'cloud-services',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/cloud-services/*',
				},
				{
					role_title: common.SESSION_MANAGER_ROLE,
					permission_id: await getPermissionId(
						'cloud-services',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/cloud-services/*'
					),
					module: 'cloud-services',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/cloud-services/*',
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId('organization', ['POST'], '/user/v1/organization/create'),
					module: 'organization',
					request_type: ['POST'],
					api_path: '/user/v1/organization/create',
				},
				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId('organization', ['POST'], '/user/v1/organization/update*'),
					module: 'organization',
					request_type: ['POST'],
					api_path: '/user/v1/organization/update*',
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId('organization', ['POST'], '/user/v1/organization/update*'),
					module: 'organization',
					request_type: ['POST'],
					api_path: '/user/v1/organization/update*',
				},
				{
					role_title: common.MENTEE_ROLE,
					permission_id: await getPermissionId(
						'organization',
						['POST'],
						'/user/v1/organization/requestOrgRole'
					),
					module: 'organization',
					request_type: ['POST'],
					api_path: '/user/v1/organization/requestOrgRole',
				},
				{
					role_title: common.MENTOR_ROLE,
					permission_id: await getPermissionId(
						'organization',
						['POST'],
						'/user/v1/organization/requestOrgRole'
					),
					module: 'organization',
					request_type: ['POST'],
					api_path: '/user/v1/organization/requestOrgRole',
				},
				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId(
						'organization',
						['POST'],
						'/user/v1/organization/requestOrgRole'
					),
					module: 'organization',
					request_type: ['POST'],
					api_path: '/user/v1/organization/requestOrgRole',
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId(
						'organization',
						['POST'],
						'/user/v1/organization/requestOrgRole'
					),
					module: 'organization',
					request_type: ['POST'],
					api_path: '/user/v1/organization/requestOrgRole',
				},
				{
					role_title: common.SESSION_MANAGER_ROLE,
					permission_id: await getPermissionId(
						'organization',
						['POST'],
						'/user/v1/organization/requestOrgRole'
					),
					module: 'organization',
					request_type: ['POST'],
					api_path: '/user/v1/organization/requestOrgRole',
				},
				{
					role_title: common.USER_ROLE,
					permission_id: await getPermissionId(
						'organization',
						['POST'],
						'/user/v1/organization/requestOrgRole'
					),
					module: 'organization',
					request_type: ['POST'],
					api_path: '/user/v1/organization/requestOrgRole',
				},
				{
					role_title: common.MENTOR_ROLE,
					permission_id: await getPermissionId('organization', ['GET'], '/user/v1/organization/*'),
					module: 'organization',
					request_type: ['GET'],
					api_path: '/user/v1/organization/*',
				},
				{
					role_title: common.MENTEE_ROLE,
					permission_id: await getPermissionId('organization', ['GET'], '/user/v1/organization/*'),
					module: 'organization',
					request_type: ['GET'],
					api_path: '/user/v1/organization/*',
				},
				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId('organization', ['GET'], '/user/v1/organization/*'),
					module: 'organization',
					request_type: ['GET'],
					api_path: '/user/v1/organization/*',
				},
				{
					role_title: common.USER_ROLE,
					permission_id: await getPermissionId('organization', ['GET'], '/user/v1/organization/*'),
					module: 'organization',
					request_type: ['GET'],
					api_path: '/user/v1/organization/*',
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId('organization', ['GET'], '/user/v1/organization/*'),
					module: 'organization',
					request_type: ['GET'],
					api_path: '/user/v1/organization/*',
				},
				{
					role_title: common.SESSION_MANAGER_ROLE,
					permission_id: await getPermissionId('organization', ['GET'], '/user/v1/organization/*'),
					module: 'organization',
					request_type: ['GET'],
					api_path: '/user/v1/organization/*',
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId(
						'entity-type',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/entity-type/*'
					),
					module: 'entity-type',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/entity-type/*',
				},
				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId(
						'entity-type',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/entity-type/*'
					),
					module: 'entity-type',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/entity-type/*',
				},
				{
					role_title: common.MENTOR_ROLE,
					permission_id: await getPermissionId('entity-type', ['POST'], '/user/v1/entity-type/read'),
					module: 'entity-type',
					request_type: ['POST'],
					api_path: '/user/v1/entity-type/read',
				},
				{
					role_title: common.MENTEE_ROLE,
					permission_id: await getPermissionId('entity-type', ['POST'], '/user/v1/entity-type/read'),
					module: 'entity-type',
					request_type: ['POST'],
					api_path: '/user/v1/entity-type/read',
				},
				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId('entity-type', ['POST'], '/user/v1/entity-type/read'),
					module: 'entity-type',
					request_type: ['POST'],
					api_path: '/user/v1/entity-type/read',
				},
				{
					role_title: common.USER_ROLE,
					permission_id: await getPermissionId('entity-type', ['POST'], '/user/v1/entity-type/read'),
					module: 'entity-type',
					request_type: ['POST'],
					api_path: '/user/v1/entity-type/read',
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId('entity-type', ['POST'], '/user/v1/entity-type/read'),
					module: 'entity-type',
					request_type: ['POST'],
					api_path: '/user/v1/entity-type/read',
				},
				{
					role_title: common.SESSION_MANAGER_ROLE,
					permission_id: await getPermissionId('entity-type', ['POST'], '/user/v1/entity-type/read'),
					module: 'entity-type',
					request_type: ['POST'],
					api_path: '/user/v1/entity-type/read',
				},

				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId(
						'entity',
						['POST', 'DELETE', 'PUT', 'PATCH'],
						'/user/v1/entity/*'
					),
					module: 'entity',
					request_type: ['POST', 'DELETE', 'PUT', 'PATCH'],
					api_path: '/user/v1/entity/*',
				},

				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId(
						'entity',
						['POST', 'DELETE', 'PUT', 'PATCH'],
						'/user/v1/entity/*'
					),
					module: 'entity',
					request_type: ['POST', 'DELETE', 'PUT', 'PATCH'],
					api_path: '/user/v1/entity/*',
				},
				{
					role_title: common.MENTOR_ROLE,
					permission_id: await getPermissionId('entity', ['GET'], '/user/v1/entity/read*'),
					module: 'entity',
					request_type: ['GET'],
					api_path: '/user/v1/entity/read*',
				},
				{
					role_title: common.MENTEE_ROLE,
					permission_id: await getPermissionId('entity', ['GET'], '/user/v1/entity/read*'),
					module: 'entity',
					request_type: ['GET'],
					api_path: '/user/v1/entity/read*',
				},
				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId('entity', ['GET'], '/user/v1/entity/read*'),
					module: 'entity',
					request_type: ['GET'],
					api_path: '/user/v1/entity/read*',
				},
				{
					role_title: common.USER_ROLE,
					permission_id: await getPermissionId('entity', ['GET'], '/user/v1/entity/read*'),
					module: 'entity',
					request_type: ['GET'],
					api_path: '/user/v1/entity/read*',
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId('entity', ['GET'], '/user/v1/entity/read*'),
					module: 'entity',
					request_type: ['GET'],
					api_path: '/user/v1/entity/read*',
				},
				{
					role_title: common.SESSION_MANAGER_ROLE,
					permission_id: await getPermissionId('entity', ['GET'], '/user/v1/entity/read*'),
					module: 'entity',
					request_type: ['GET'],
					api_path: '/user/v1/entity/read*',
				},
				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId(
						'org-admin',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/org-admin/*'
					),
					module: 'org-admin',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/org-admin/*',
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId(
						'notification',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/notification/*'
					),
					module: 'notification',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/notification/*',
				},
				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId(
						'notification',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/notification/*'
					),
					module: 'notification',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/notification/*',
				},
				{
					role_title: common.MENTOR_ROLE,
					permission_id: await getPermissionId('account', ['GET'], '/user/v1/account/list'),
					module: 'account',
					request_type: ['GET'],
					api_path: '/user/v1/account/list',
				},
				{
					role_title: common.MENTEE_ROLE,
					permission_id: await getPermissionId('account', ['GET'], '/user/v1/account/list'),
					module: 'account',
					request_type: ['GET'],
					api_path: '/user/v1/account/list',
				},
				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId('account', ['GET'], '/user/v1/account/list'),
					module: 'account',
					request_type: ['GET'],
					api_path: '/user/v1/account/list',
				},
				{
					role_title: common.USER_ROLE,
					permission_id: await getPermissionId('account', ['GET'], '/user/v1/account/list'),
					module: 'account',
					request_type: ['GET'],
					api_path: '/user/v1/account/list',
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId('account', ['GET'], '/user/v1/account/list'),
					module: 'account',
					request_type: ['GET'],
					api_path: '/user/v1/account/list',
				},
				{
					role_title: common.SESSION_MANAGER_ROLE,
					permission_id: await getPermissionId('account', ['GET'], '/user/v1/account/list'),
					module: 'account',
					request_type: ['GET'],
					api_path: '/user/v1/account/list',
				},
				{
					role_title: common.MENTOR_ROLE,
					permission_id: await getPermissionId('account', ['POST'], '/user/v1/account/logout'),
					module: 'account',
					request_type: ['POST'],
					api_path: '/user/v1/account/logout',
				},
				{
					role_title: common.MENTEE_ROLE,
					permission_id: await getPermissionId('account', ['POST'], '/user/v1/account/logout'),
					module: 'account',
					request_type: ['POST'],
					api_path: '/user/v1/account/logout',
				},
				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId('account', ['POST'], '/user/v1/account/logout'),
					module: 'account',
					request_type: ['POST'],
					api_path: '/user/v1/account/logout',
				},
				{
					role_title: common.USER_ROLE,
					permission_id: await getPermissionId('account', ['POST'], '/user/v1/account/logout'),
					module: 'account',
					request_type: ['POST'],
					api_path: '/user/v1/account/logout',
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId('account', ['POST'], '/user/v1/account/logout'),
					module: 'account',
					request_type: ['POST'],
					api_path: '/user/v1/account/logout',
				},
				{
					role_title: common.SESSION_MANAGER_ROLE,
					permission_id: await getPermissionId('account', ['POST'], '/user/v1/account/logout'),
					module: 'account',
					request_type: ['POST'],
					api_path: '/user/v1/account/logout',
				},
				{
					role_title: common.MENTOR_ROLE,
					permission_id: await getPermissionId('account', ['POST'], '/user/v1/account/search'),
					module: 'account',
					request_type: ['POST'],
					api_path: '/user/v1/account/search',
				},
				{
					role_title: common.MENTEE_ROLE,
					permission_id: await getPermissionId('account', ['POST'], '/user/v1/account/search'),
					module: 'account',
					request_type: ['POST'],
					api_path: '/user/v1/account/search',
				},
				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId('account', ['POST'], '/user/v1/account/search'),
					module: 'account',
					request_type: ['POST'],
					api_path: '/user/v1/account/search',
				},
				{
					role_title: common.USER_ROLE,
					permission_id: await getPermissionId('account', ['POST'], '/user/v1/account/search'),
					module: 'account',
					request_type: ['POST'],
					api_path: '/user/v1/account/search',
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId('account', ['POST'], '/user/v1/account/search'),
					module: 'account',
					request_type: ['POST'],
					api_path: '/user/v1/account/search',
				},
				{
					role_title: common.SESSION_MANAGER_ROLE,
					permission_id: await getPermissionId('account', ['POST'], '/user/v1/account/search'),
					module: 'account',
					request_type: ['POST'],
					api_path: '/user/v1/account/search',
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId('admin', ['DELETE'], '/user/v1/admin/delete*'),
					module: 'admin',
					request_type: ['DELETE'],
					api_path: '/user/v1/admin/delete*',
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId('admin', ['POST'], '/user/v1/admin/deactivateOrg/:id'),
					module: 'admin',
					request_type: ['POST'],
					api_path: '/user/v1/admin/deactivateOrg/:id',
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId('admin', ['POST'], '/user/v1/admin/addOrgAdmin'),
					module: 'admin',
					request_type: ['POST'],
					api_path: '/user/v1/admin/addOrgAdmin',
				},
				{
					role_title: common.PUBLIC_ROLE,
					permission_id: await getPermissionId(
						'account',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/account/*'
					),
					module: 'account',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/account/*',
				},
				{
					role_title: common.PUBLIC_ROLE,
					permission_id: await getPermissionId('admin', ['POST'], '/user/v1/admin/create'),
					module: 'admin',
					request_type: ['POST'],
					api_path: '/user/v1/admin/create',
				},
				{
					role_title: common.PUBLIC_ROLE,
					permission_id: await getPermissionId('admin', ['POST'], '/user/v1/admin/login'),
					module: 'admin',
					request_type: ['POST'],
					api_path: '/user/v1/admin/login',
				},
				{
					role_title: common.MENTOR_ROLE,
					permission_id: await getPermissionId('user-role', ['GET'], '/user/v1/user-role/list'),
					module: 'user-role',
					request_type: ['GET'],
					api_path: '/user/v1/user-role/list',
				},
				{
					role_title: common.MENTEE_ROLE,
					permission_id: await getPermissionId('user-role', ['GET'], '/user/v1/user-role/list'),
					module: 'user-role',
					request_type: ['GET'],
					api_path: '/user/v1/user-role/list',
				},
				{
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId('user-role', ['GET'], '/user/v1/user-role/list'),
					module: 'user-role',
					request_type: ['GET'],
					api_path: '/user/v1/user-role/list',
				},
				{
					role_title: common.USER_ROLE,
					permission_id: await getPermissionId('user-role', ['GET'], '/user/v1/user-role/list'),
					module: 'user-role',
					request_type: ['GET'],
					api_path: '/user/v1/user-role/list',
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId('user-role', ['GET'], '/user/v1/user-role/list'),
					module: 'user-role',
					request_type: ['GET'],
					api_path: '/user/v1/user-role/list',
				},
				{
					role_title: common.SESSION_MANAGER_ROLE,
					permission_id: await getPermissionId('user-role', ['GET'], '/user/v1/user-role/list'),
					module: 'user-role',
					request_type: ['GET'],
					api_path: '/user/v1/user-role/list',
				},
			])

			await queryInterface.bulkInsert(
				'role_permission_mapping',
				rolePermissionsData.map((data) => ({
					...data,
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				}))
			)
		} catch (error) {
			console.log(error)
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
