'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		const modulesData = [
			{ code: 'all', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'manage_session', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'mentee', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'modules', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'permissions', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
		]

		// Insert the data into the 'modules' table
		await queryInterface.bulkInsert('modules', modulesData)
	},

	down: async (queryInterface, Sequelize) => {
		// Remove the 'modules' table
		await queryInterface.dropTable('modules')
	},
}
