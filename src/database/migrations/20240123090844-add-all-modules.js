'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		const modulesData = [
			{ code: 'cloud_services', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'entity_type', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'entity', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'feedback', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'form', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'issues', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'mentors', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'notification', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'org_admin', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'organization', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'platform', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'profile', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'questions', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'sessions', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'users', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'role_permission_mapping', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
		]

		// Insert the data into the 'modules' table
		await queryInterface.bulkInsert('modules', modulesData)
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('modules', null, {})
	},
}
