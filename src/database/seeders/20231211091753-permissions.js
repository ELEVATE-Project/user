'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		try {
			const permissionsData = [
				{
					code: 'All_session',
					module: 'All',
					actions: 'ALL',
					status: 'ACTIVE',
					created_at: new Date(),
					updated_at: new Date(),
				},
				{
					code: 'READ_session',
					module: 'ManageSession',
					actions: 'READ',
					status: 'ACTIVE',
					created_at: new Date(),
					updated_at: new Date(),
				},
				{
					code: 'WRITE_session',
					module: 'Mentee',
					actions: 'WRITE',
					status: 'ACTIVE',
					created_at: new Date(),
					updated_at: new Date(),
				},
				{
					code: 'UPDATE_session',
					module: 'Modules',
					actions: 'UPDATE',
					status: 'ACTIVE',
					created_at: new Date(),
					updated_at: new Date(),
				},
				{
					code: 'DELETE_session',
					module: 'Permissions',
					actions: 'DELETE',
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
