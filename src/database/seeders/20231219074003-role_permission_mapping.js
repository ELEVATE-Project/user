'use strict'

require('module-alias/register')
const userRequests = require('@requests/user')
require('dotenv').config()
const common = require('@constants/common')
const Permissions = require('@database/models/index').Permission

let matchingResults

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

		const titles = [common.SESSION_MANAGER_ROLE, common.ADMIN_ROLE]

		matchingResults = {}

		await Promise.all(
			titles.map(async (title) => {
				const matchingRole = allRoles.find((role) => role.title === title)

				if (matchingRole) {
					matchingResults[title] = matchingRole
				} else {
					throw error
				}
			})
		)
	} catch (error) {
		throw error
	}
}

const getPermissionId = async (code, actions) => {
	try {
		const permission = await Permissions.findOne({
			where: {
				code,
				actions,
			},
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
					permission_id: await getPermissionId(common.MANAGE_SESSION_CODE, ['ALL']),
					module: common.MANAGE_SESSION_CODE,
					actions: ['ALL'],
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults[common.ADMIN_ROLE].id,
					permission_id: await getPermissionId(common.MANAGE_SESSION_CODE, ['ALL']),
					module: common.MANAGE_SESSION_CODE,
					actions: ['ALL'],
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
