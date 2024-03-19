'use strict'

/** @type {import('sequelize-cli').Migration} */

require('module-alias/register')
require('dotenv').config()
const common = require('@constants/common')
const Permissions = require('@database/models/index').Permission
const rolePermission = require('@database/models/index').RolePermission

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
			const rolePermissionsData = await Promise.all([
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId('organization', ['POST'], 'user/v1/organization/update/*'),
					module: 'organization',
					request_type: ['POST'],
					api_path: 'user/v1/organization/update/*',
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId(
						'organization',
						['POST'],
						'user/v1/organization/addRelatedOrg/*'
					),
					module: 'organization',
					request_type: ['POST'],
					api_path: 'user/v1/organization/addRelatedOrg/*',
				},
				{
					role_title: common.ADMIN_ROLE,
					permission_id: await getPermissionId(
						'organization',
						['POST'],
						'user/v1/organization/removeRelatedOrg/*'
					),
					module: 'organization',
					request_type: ['POST'],
					api_path: 'user/v1/organization/removeRelatedOrg/*',
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

	async down(queryInterface, Sequelize) {
		try {
			// Array of objects representing data to be deleted
			const dataToDelete = [
				{
					role_title: common.ADMIN_ROLE,
					module: 'organization',
					request_type: ['POST'],
					api_path: 'user/v1/organization/update/*',
				},
				{
					role_title: common.ADMIN_ROLE,
					module: 'organization',
					request_type: ['POST'],
					api_path: 'user/v1/organization/addRelatedOrg/*',
				},
				{
					role_title: common.ADMIN_ROLE,
					module: 'organization',
					request_type: ['POST'],
					api_path: 'user/v1/organization/removeRelatedOrg/*',
				},
			]

			// Delete records based on each object's criteria
			for (const item of dataToDelete) {
				const permissionId = await getPermissionId(item.module, item.request_type, item.api_path)

				await queryInterface.bulkDelete('role_permission_mapping', {
					role_title: item.role_title,
					permission_id: permissionId,
					module: item.module,
					api_path: item.api_path,
				})
			}
		} catch (error) {
			console.error('Error rolling back migration:', error)
			throw error
		}
	},
}
