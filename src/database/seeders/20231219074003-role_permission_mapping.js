'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		try {
			const rolePermissionsData = [
				{
					role_id: 6,
					permission_id: 1,
					module: 'manage_session',
					actions: ['ALL'],
					created_at: new Date(),
					updated_at: new Date(),
				},
				{
					role_id: 4,
					permission_id: 1,
					module: 'manage_session',
					actions: ['ALL'],
					created_at: new Date(),
					updated_at: new Date(),
				},
			]
			await queryInterface.bulkInsert('role_permission_mapping', rolePermissionsData)
		} catch (error) {
			console.log(error)
		}
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable('role_permission_mapping')
	},
}
