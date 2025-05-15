'use strict'
require('module-alias/register')
require('dotenv').config()
const common = require('@constants/common')
const Permissions = require('@database/models/index').Permission

/** @type {import('sequelize-cli').Migration} */

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
					role_title: common.PUBLIC_ROLE,
					permission_id: await getPermissionId('form', ['POST'], '/user/v1/form/read*'),
					module: 'form',
					request_type: ['POST'],
					api_path: '/user/v1/form/read*',
				},
			])
			console.log('============>>>> ', rolePermissionsData)
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
			console.log('Error  : ', error)
		}
	},

	async down(queryInterface, Sequelize) {
		try {
			const permission_id = await Promise.all({
				id: await getPermissionId('form', ['POST'], '/user/v1/form/read*'),
			})
			await queryInterface.bulkDelete(
				'role_permission_mapping',
				{
					permission_id: permission_id.id,
					role_title: common.PUBLIC_ROLE,
					module: 'form',
					request_type: ['POST'],
					api_path: '/user/v1/form/read*',
				},
				{}
			)
		} catch (error) {}
	},
}
