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
		const titles = [common.SESSION_MANAGER_ROLE, common.ADMIN_ROLE, common.MENTOR_ROLE, common.ORG_ADMIN_ROLE]
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
			throw new Error(
				`Permission with ( module : ${module} , request_type : ${request_type} , api_path : ${api_path} ) not found.`
			)
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
			const orgAdminId = matchingResults[common.ORG_ADMIN_ROLE].id

			const rolePermissionsData = [
				{
					role_id: orgAdminId,
					permission_id: await getPermissionId('entity-type', ['POST'], '/mentoring/v1/entity-type/read'),
					module: 'entity-type',
					request_type: ['POST'],
					api_path: '/mentoring/v1/entity-type/read',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: orgAdminId,
					permission_id: await getPermissionId('entity-type', ['POST'], '/mentoring/v1/entity-type/read/:id'),
					module: 'entity-type',
					request_type: ['POST'],
					api_path: '/mentoring/v1/entity-type/read/:id',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: orgAdminId,
					permission_id: await getPermissionId('entity-type', ['POST'], '/mentoring/v1/entity-type/create'),
					module: 'entity-type',
					request_type: ['POST'],
					api_path: '/mentoring/v1/entity-type/create',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: orgAdminId,
					permission_id: await getPermissionId(
						'entity-type',
						['POST'],
						'/mentoring/v1/entity-type/update/:id'
					),
					module: 'entity-type',
					request_type: ['POST'],
					api_path: '/mentoring/v1/entity-type/update/:id',
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: orgAdminId,
					permission_id: await getPermissionId(
						'entity-type',
						['DELETE'],
						'/mentoring/v1/entity-type/delete/:id'
					),
					module: 'entity-type',
					request_type: ['DELETE'],
					api_path: '/mentoring/v1/entity-type/delete/:id',
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
			api_path: [
				'/mentoring/v1/entity-type/read',
				'/mentoring/v1/entity-type/read/:id',
				'/mentoring/v1/entity-type/create',
				'/mentoring/v1/entity-type/update/:id',
				'/mentoring/v1/entity-type/delete/:id',
			],
		})
	},
}
