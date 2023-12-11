'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		const modulesData = [
			{ code: 'All', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'ManageSession', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'Mentee', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'Modules', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'Permissions', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
		]

		// Insert the data into the 'modules' table
		await queryInterface.bulkInsert('modules', modulesData)
	},

	down: async (queryInterface, Sequelize) => {
		// Remove the 'modules' table
		await queryInterface.dropTable('modules')
	},
}
