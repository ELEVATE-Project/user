'use strict'

require('module-alias/register')
const userRequests = require('@requests/user')
require('dotenv').config()
const common = require('@constants/common')
const Permissions = require('@database/models/index').Permission

let matchingResults

const updateMentorNamesBasedOnRole = async () => {
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

const getPermissionId = async (module, actions) => {
	try {
		// Customize this query based on your requirements
		const permission = await Permissions.findOne({
			where: {
				module,
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
			await updateMentorNamesBasedOnRole()

			const rolePermissionsData = [
				{
					role_id: matchingResults['session_manager'].id,
					permission_id: await getPermissionId('manage_session', ['ALL']),
					module: 'manage_session',
					actions: ['ALL'],
					created_at: new Date(),
					updated_at: new Date(),
					created_by: 0,
				},
				{
					role_id: matchingResults['admin'].id,
					permission_id: await getPermissionId('manage_session', ['ALL']),
					module: 'manage_session',
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
