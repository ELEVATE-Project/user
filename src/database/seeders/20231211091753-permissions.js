'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		try {
			const permissionsData = [
				{
					code: 'all_session',
					module: 'all',
					actions: ['ALL', 'READ'],
					status: 'ACTIVE',
					created_at: new Date(),
					updated_at: new Date(),
				},
				{
					code: 'read_session',
					module: 'manage_session',
					actions: ['READ'],
					status: 'ACTIVE',
					created_at: new Date(),
					updated_at: new Date(),
				},
				{
					code: 'write_session',
					module: 'mentee',
					actions: ['WRITE'],
					status: 'ACTIVE',
					created_at: new Date(),
					updated_at: new Date(),
				},
				{
					code: 'update_session',
					module: 'modules',
					actions: ['UPDATE'],
					status: 'ACTIVE',
					created_at: new Date(),
					updated_at: new Date(),
				},
				{
					code: 'delete_session',
					module: 'permissions',
					actions: ['DELETE'],
					status: 'ACTIVE',
					created_at: new Date(),
					updated_at: new Date(),
				},
			]

			// Insert the data into the 'permissions' table
			await queryInterface.bulkInsert('permissions', permissionsData)
		} catch (error) {
			console.log(error)
		}
	},

	down: async (queryInterface, Sequelize) => {
		// Remove the 'permissions' table
		await queryInterface.dropTable('permissions')
	},
}
