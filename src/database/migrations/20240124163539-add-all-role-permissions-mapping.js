'use strict'

require('module-alias/register')
const userRoles = require('@database/models/index').UserRole
require('dotenv').config()
const common = require('@constants/common')
const Permissions = require('@database/models/index').Permission
const { Op } = require('sequelize')
const organizationQueries = require('@database/queries/organization')

let matchingResults = {}

const getRoleIds = async () => {
	try {
		const search = common.SEARCH
		const filter = { title: { [Op.iLike]: `%${search}%` } }
		const attributes = ['id', 'title', 'user_type', 'visibility', 'status', 'organization_id']
		const response = await userRoles.findAndCountAll({ where: filter, attributes })
		const allRoles = response.rows
		if (!allRoles || !Array.isArray(allRoles)) {
			throw new Error('No roles found.')
		}
		const roleIds = allRoles.map((role) => role.id)
		const titles = [
			common.SESSION_MANAGER_ROLE,
			common.ADMIN_ROLE,
			common.MENTOR_ROLE,
			common.MENTEE_ROLE,
			common.ORG_ADMIN_ROLE,
			common.USER_ROLE,
			common.PUBLIC_ROLE,
		]
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
					role_id: matchingResults[common.MENTOR_ROLE].id,
					permission_id: await getPermissionId(
						'user',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/user/*'
					),
					module: 'user',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/user/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.MENTEE_ROLE].id,
					permission_id: await getPermissionId(
						'user',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/user/*'
					),
					module: 'user',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/user/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.ORG_ADMIN_ROLE].id,
					permission_id: await getPermissionId(
						'user',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/user/*'
					),
					module: 'user',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/user/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.USER_ROLE].id,
					permission_id: await getPermissionId(
						'user',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/user/*'
					),
					module: 'user',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/user/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.ADMIN_ROLE].id,
					permission_id: await getPermissionId(
						'user',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/user/*'
					),
					module: 'user',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/user/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.SESSION_MANAGER_ROLE].id,
					permission_id: await getPermissionId(
						'user',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/user/*'
					),
					module: 'user',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/user/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.MENTOR_ROLE].id,
					permission_id: await getPermissionId('user', ['GET'], '/user/v1/user/share*'),
					module: 'user',
					request_type: ['GET'],
					api_path: '/user/v1/user/share*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.PUBLIC_ROLE].id,
					permission_id: await getPermissionId('user-role', ['GET'], '/user/v1/user-role/default'),
					module: 'user-role',
					request_type: ['GET'],
					api_path: '/user/v1/user-role/default',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.ADMIN_ROLE].id,
					permission_id: await getPermissionId(
						'user-role',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/user-role/*'
					),
					module: 'user-role',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/user-role/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.MENTOR_ROLE].id,
					permission_id: await getPermissionId(
						'form',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/form/*'
					),
					module: 'form',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/form/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.MENTEE_ROLE].id,
					permission_id: await getPermissionId(
						'form',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/form/*'
					),
					module: 'form',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/form/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.ORG_ADMIN_ROLE].id,
					permission_id: await getPermissionId(
						'form',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/form/*'
					),
					module: 'form',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/form/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.USER_ROLE].id,
					permission_id: await getPermissionId(
						'form',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/form/*'
					),
					module: 'form',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/form/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.ADMIN_ROLE].id,
					permission_id: await getPermissionId(
						'form',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/form/*'
					),
					module: 'form',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/form/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.SESSION_MANAGER_ROLE].id,
					permission_id: await getPermissionId(
						'form',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/form/*'
					),
					module: 'form',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/form/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.MENTOR_ROLE].id,
					permission_id: await getPermissionId(
						'cloud-services',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/cloud-services/*'
					),
					module: 'cloud-services',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/cloud-services/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.MENTEE_ROLE].id,
					permission_id: await getPermissionId(
						'cloud-services',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/cloud-services/*'
					),
					module: 'cloud-services',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/cloud-services/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.ORG_ADMIN_ROLE].id,
					permission_id: await getPermissionId(
						'cloud-services',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/cloud-services/*'
					),
					module: 'cloud-services',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/cloud-services/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.USER_ROLE].id,
					permission_id: await getPermissionId(
						'cloud-services',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/cloud-services/*'
					),
					module: 'cloud-services',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/cloud-services/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.ADMIN_ROLE].id,
					permission_id: await getPermissionId(
						'cloud-services',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/cloud-services/*'
					),
					module: 'cloud-services',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/cloud-services/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.SESSION_MANAGER_ROLE].id,
					permission_id: await getPermissionId(
						'cloud-services',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/cloud-services/*'
					),
					module: 'cloud-services',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/cloud-services/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.ADMIN_ROLE].id,
					permission_id: await getPermissionId('organization', ['POST'], '/user/v1/organization/create'),
					module: 'organization',
					request_type: ['POST'],
					api_path: '/user/v1/organization/create',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.ORG_ADMIN_ROLE].id,
					permission_id: await getPermissionId('organization', ['POST'], '/user/v1/organization/update*'),
					module: 'organization',
					request_type: ['POST'],
					api_path: '/user/v1/organization/update*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.ADMIN_ROLE].id,
					permission_id: await getPermissionId('organization', ['POST'], '/user/v1/organization/update*'),
					module: 'organization',
					request_type: ['POST'],
					api_path: '/user/v1/organization/update*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.MENTEE_ROLE].id,
					permission_id: await getPermissionId(
						'organization',
						['POST'],
						'/user/v1/organization/requestOrgRole'
					),
					module: 'organization',
					request_type: ['POST'],
					api_path: '/user/v1/organization/requestOrgRole',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.MENTOR_ROLE].id,
					permission_id: await getPermissionId('organization', ['GET'], '/user/v1/organization/*'),
					module: 'organization',
					request_type: ['GET'],
					api_path: '/user/v1/organization/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.MENTEE_ROLE].id,
					permission_id: await getPermissionId('organization', ['GET'], '/user/v1/organization/*'),
					module: 'organization',
					request_type: ['GET'],
					api_path: '/user/v1/organization/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.ORG_ADMIN_ROLE].id,
					permission_id: await getPermissionId('organization', ['GET'], '/user/v1/organization/*'),
					module: 'organization',
					request_type: ['GET'],
					api_path: '/user/v1/organization/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.USER_ROLE].id,
					permission_id: await getPermissionId('organization', ['GET'], '/user/v1/organization/*'),
					module: 'organization',
					request_type: ['GET'],
					api_path: '/user/v1/organization/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.ADMIN_ROLE].id,
					permission_id: await getPermissionId('organization', ['GET'], '/user/v1/organization/*'),
					module: 'organization',
					request_type: ['GET'],
					api_path: '/user/v1/organization/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.SESSION_MANAGER_ROLE].id,
					permission_id: await getPermissionId('organization', ['GET'], '/user/v1/organization/*'),
					module: 'organization',
					request_type: ['GET'],
					api_path: '/user/v1/organization/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.ADMIN_ROLE].id,
					permission_id: await getPermissionId(
						'entity-type',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/entity-type/*'
					),
					module: 'entity-type',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/entity-type/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.ORG_ADMIN_ROLE].id,
					permission_id: await getPermissionId(
						'entity-type',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/entity-type/*'
					),
					module: 'entity-type',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/entity-type/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.MENTOR_ROLE].id,
					permission_id: await getPermissionId('entity-type', ['GET'], '/user/v1/entity-type/read'),
					module: 'entity-type',
					request_type: ['GET'],
					api_path: '/user/v1/entity-type/read',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.MENTEE_ROLE].id,
					permission_id: await getPermissionId('entity-type', ['GET'], '/user/v1/entity-type/read'),
					module: 'entity-type',
					request_type: ['GET'],
					api_path: '/user/v1/entity-type/read',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.ORG_ADMIN_ROLE].id,
					permission_id: await getPermissionId('entity-type', ['GET'], '/user/v1/entity-type/read'),
					module: 'entity-type',
					request_type: ['GET'],
					api_path: '/user/v1/entity-type/read',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.USER_ROLE].id,
					permission_id: await getPermissionId('entity-type', ['GET'], '/user/v1/entity-type/read'),
					module: 'entity-type',
					request_type: ['GET'],
					api_path: '/user/v1/entity-type/read',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.ADMIN_ROLE].id,
					permission_id: await getPermissionId('entity-type', ['GET'], '/user/v1/entity-type/read'),
					module: 'entity-type',
					request_type: ['GET'],
					api_path: '/user/v1/entity-type/read',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.SESSION_MANAGER_ROLE].id,
					permission_id: await getPermissionId('entity-type', ['GET'], '/user/v1/entity-type/read'),
					module: 'entity-type',
					request_type: ['GET'],
					api_path: '/user/v1/entity-type/read',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.MENTOR_ROLE].id,
					permission_id: await getPermissionId(
						'entity',
						['POST', 'DELETE', 'PUT', 'PATCH'],
						'/user/v1/entity/*'
					),
					module: 'entity',
					request_type: ['POST', 'DELETE', 'PUT', 'PATCH'],
					api_path: '/user/v1/entity/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.MENTEE_ROLE].id,
					permission_id: await getPermissionId(
						'entity',
						['POST', 'DELETE', 'PUT', 'PATCH'],
						'/user/v1/entity/*'
					),
					module: 'entity',
					request_type: ['POST', 'DELETE', 'PUT', 'PATCH'],
					api_path: '/user/v1/entity/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.ORG_ADMIN_ROLE].id,
					permission_id: await getPermissionId(
						'entity',
						['POST', 'DELETE', 'PUT', 'PATCH'],
						'/user/v1/entity/*'
					),
					module: 'entity',
					request_type: ['POST', 'DELETE', 'PUT', 'PATCH'],
					api_path: '/user/v1/entity/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.USER_ROLE].id,
					permission_id: await getPermissionId(
						'entity',
						['POST', 'DELETE', 'PUT', 'PATCH'],
						'/user/v1/entity/*'
					),
					module: 'entity',
					request_type: ['POST', 'DELETE', 'PUT', 'PATCH'],
					api_path: '/user/v1/entity/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.ADMIN_ROLE].id,
					permission_id: await getPermissionId(
						'entity',
						['POST', 'DELETE', 'PUT', 'PATCH'],
						'/user/v1/entity/*'
					),
					module: 'entity',
					request_type: ['POST', 'DELETE', 'PUT', 'PATCH'],
					api_path: '/user/v1/entity/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.SESSION_MANAGER_ROLE].id,
					permission_id: await getPermissionId(
						'entity',
						['POST', 'DELETE', 'PUT', 'PATCH'],
						'/user/v1/entity/*'
					),
					module: 'entity',
					request_type: ['POST', 'DELETE', 'PUT', 'PATCH'],
					api_path: '/user/v1/entity/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.MENTOR_ROLE].id,
					permission_id: await getPermissionId('entity', ['GET'], '/user/v1/entity/read*'),
					module: 'entity',
					request_type: ['GET'],
					api_path: '/user/v1/entity/read*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.MENTEE_ROLE].id,
					permission_id: await getPermissionId('entity', ['GET'], '/user/v1/entity/read*'),
					module: 'entity',
					request_type: ['GET'],
					api_path: '/user/v1/entity/read*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.ORG_ADMIN_ROLE].id,
					permission_id: await getPermissionId('entity', ['GET'], '/user/v1/entity/read*'),
					module: 'entity',
					request_type: ['GET'],
					api_path: '/user/v1/entity/read*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.USER_ROLE].id,
					permission_id: await getPermissionId('entity', ['GET'], '/user/v1/entity/read*'),
					module: 'entity',
					request_type: ['GET'],
					api_path: '/user/v1/entity/read*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.ADMIN_ROLE].id,
					permission_id: await getPermissionId('entity', ['GET'], '/user/v1/entity/read*'),
					module: 'entity',
					request_type: ['GET'],
					api_path: '/user/v1/entity/read*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.SESSION_MANAGER_ROLE].id,
					permission_id: await getPermissionId('entity', ['GET'], '/user/v1/entity/read*'),
					module: 'entity',
					request_type: ['GET'],
					api_path: '/user/v1/entity/read*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.ORG_ADMIN_ROLE].id,
					permission_id: await getPermissionId(
						'org-admin',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/org-admin/*'
					),
					module: 'org-admin',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/org-admin/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.ADMIN_ROLE].id,
					permission_id: await getPermissionId(
						'notification',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/notification/*'
					),
					module: 'notification',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/notification/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.ORG_ADMIN_ROLE].id,
					permission_id: await getPermissionId(
						'notification',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/notification/*'
					),
					module: 'notification',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/notification/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.MENTOR_ROLE].id,
					permission_id: await getPermissionId('account', ['GET'], '/user/v1/account/list'),
					module: 'account',
					request_type: ['GET'],
					api_path: '/user/v1/account/list',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.MENTEE_ROLE].id,
					permission_id: await getPermissionId('account', ['GET'], '/user/v1/account/list'),
					module: 'account',
					request_type: ['GET'],
					api_path: '/user/v1/account/list',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.ORG_ADMIN_ROLE].id,
					permission_id: await getPermissionId('account', ['GET'], '/user/v1/account/list'),
					module: 'account',
					request_type: ['GET'],
					api_path: '/user/v1/account/list',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.USER_ROLE].id,
					permission_id: await getPermissionId('account', ['GET'], '/user/v1/account/list'),
					module: 'account',
					request_type: ['GET'],
					api_path: '/user/v1/account/list',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.ADMIN_ROLE].id,
					permission_id: await getPermissionId('account', ['GET'], '/user/v1/account/list'),
					module: 'account',
					request_type: ['GET'],
					api_path: '/user/v1/account/list',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.SESSION_MANAGER_ROLE].id,
					permission_id: await getPermissionId('account', ['GET'], '/user/v1/account/list'),
					module: 'account',
					request_type: ['GET'],
					api_path: '/user/v1/account/list',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.MENTOR_ROLE].id,
					permission_id: await getPermissionId('account', ['POST'], '/user/v1/account/logout'),
					module: 'account',
					request_type: ['POST'],
					api_path: '/user/v1/account/logout',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.MENTEE_ROLE].id,
					permission_id: await getPermissionId('account', ['POST'], '/user/v1/account/logout'),
					module: 'account',
					request_type: ['POST'],
					api_path: '/user/v1/account/logout',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.ORG_ADMIN_ROLE].id,
					permission_id: await getPermissionId('account', ['POST'], '/user/v1/account/logout'),
					module: 'account',
					request_type: ['POST'],
					api_path: '/user/v1/account/logout',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.USER_ROLE].id,
					permission_id: await getPermissionId('account', ['POST'], '/user/v1/account/logout'),
					module: 'account',
					request_type: ['POST'],
					api_path: '/user/v1/account/logout',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.ADMIN_ROLE].id,
					permission_id: await getPermissionId('account', ['POST'], '/user/v1/account/logout'),
					module: 'account',
					request_type: ['POST'],
					api_path: '/user/v1/account/logout',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.SESSION_MANAGER_ROLE].id,
					permission_id: await getPermissionId('account', ['POST'], '/user/v1/account/logout'),
					module: 'account',
					request_type: ['POST'],
					api_path: '/user/v1/account/logout',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.MENTOR_ROLE].id,
					permission_id: await getPermissionId('account', ['POST'], '/user/v1/account/search'),
					module: 'account',
					request_type: ['POST'],
					api_path: '/user/v1/account/search',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.MENTEE_ROLE].id,
					permission_id: await getPermissionId('account', ['POST'], '/user/v1/account/search'),
					module: 'account',
					request_type: ['POST'],
					api_path: '/user/v1/account/search',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.ORG_ADMIN_ROLE].id,
					permission_id: await getPermissionId('account', ['POST'], '/user/v1/account/search'),
					module: 'account',
					request_type: ['POST'],
					api_path: '/user/v1/account/search',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.USER_ROLE].id,
					permission_id: await getPermissionId('account', ['POST'], '/user/v1/account/search'),
					module: 'account',
					request_type: ['POST'],
					api_path: '/user/v1/account/search',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.ADMIN_ROLE].id,
					permission_id: await getPermissionId('account', ['POST'], '/user/v1/account/search'),
					module: 'account',
					request_type: ['POST'],
					api_path: '/user/v1/account/search',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.SESSION_MANAGER_ROLE].id,
					permission_id: await getPermissionId('account', ['POST'], '/user/v1/account/search'),
					module: 'account',
					request_type: ['POST'],
					api_path: '/user/v1/account/search',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.ADMIN_ROLE].id,
					permission_id: await getPermissionId('admin', ['DELETE'], '/user/v1/admin/delete*'),
					module: 'admin',
					request_type: ['DELETE'],
					api_path: '/user/v1/admin/delete*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.ADMIN_ROLE].id,
					permission_id: await getPermissionId('admin', ['POST'], '/user/v1/admin/deactivateOrg/:id'),
					module: 'admin',
					request_type: ['POST'],
					api_path: '/user/v1/admin/deactivateOrg/:id',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.ADMIN_ROLE].id,
					permission_id: await getPermissionId('admin', ['POST'], '/user/v1/admin/addOrgAdmin'),
					module: 'admin',
					request_type: ['POST'],
					api_path: '/user/v1/admin/addOrgAdmin',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.PUBLIC_ROLE].id,
					permission_id: await getPermissionId(
						'account',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/account/*'
					),
					module: 'account',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/account/*',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.PUBLIC_ROLE].id,
					permission_id: await getPermissionId('admin', ['POST'], '/user/v1/admin/create'),
					module: 'admin',
					request_type: ['POST'],
					api_path: '/user/v1/admin/create',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.PUBLIC_ROLE].id,
					permission_id: await getPermissionId('admin', ['POST'], '/user/v1/admin/login'),
					module: 'admin',
					request_type: ['POST'],
					api_path: '/user/v1/admin/login',
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
