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
					role_title: common.ORG_ADMIN_ROLE,
					permission_id: await getPermissionId(
						'user-role',
						['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
						'/user/v1/user-role/*'
					),
					module: 'user-role',
					request_type: ['POST', 'DELETE', 'GET', 'PUT', 'PATCH'],
					api_path: '/user/v1/user-role/*',
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
