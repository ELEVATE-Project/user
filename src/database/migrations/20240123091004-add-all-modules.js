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
			{ code: 'account', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'entity_type', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'user', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'user_role', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'form', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'cloud_services', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'admin', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'organization', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'entity', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'org_admin', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'notification', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
		]

		// Insert the data into the 'modules' table
		await queryInterface.bulkInsert('modules', modulesData)
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('modules', null, {})
	},
}
