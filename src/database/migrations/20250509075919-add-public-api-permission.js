'use strict'

/** @type {import('sequelize-cli').Migration} */

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
	async up(queryInterface, Sequelize) {
		try {
			const permissionsData = [
				//Users API's

				{
					code: 'public',
					module: 'public',
					request_type: ['GET'],
					api_path: '/user/v1/public/*',
					status: 'ACTIVE',
				},
			]

			// Batch insert permissions
			await queryInterface.bulkInsert(
				'permissions',
				permissionsData.map((permission) => ({
					...permission,
					created_at: new Date(),
					updated_at: new Date(),
				}))
			)

			const modulesData = [{ code: 'public', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() }]

			// Insert the data into the 'modules' table
			await queryInterface.bulkInsert('modules', modulesData)

			const rolePermissionsData = await Promise.all([
				{
					role_title: common.PUBLIC_ROLE,
					permission_id: await getPermissionId('public', ['GET'], '/user/v1/public/*'),
					module: 'public',
					request_type: ['GET'],
					api_path: '/user/v1/public/*',
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
			console.error('Error in migration:', error)
			throw error
		}
	},

	async down(queryInterface, Sequelize) {
		try {
			// Rollback migration by deleting all permissions
			await queryInterface.bulkDelete('permissions', null, {})
		} catch (error) {
			console.error('Error in rollback migration:', error)
			throw error
		}
	},
}
