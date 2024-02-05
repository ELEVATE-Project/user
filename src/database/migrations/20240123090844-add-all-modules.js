'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('modules', null, {})

		const modulesData = [
			{ code: 'all', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'manage-session', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'mentees', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'modules', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'permissions', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'cloud-services', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'entity-type', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'entity', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'feedback', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'form', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'issues', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'mentors', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'notification', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'org-admin', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'organization', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'platform', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'profile', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'questions', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'question-set', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'admin', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'sessions', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'users', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
			{ code: 'role-permission-mapping', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
		]

		// Insert the data into the 'modules' table
		await queryInterface.bulkInsert('modules', modulesData)
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('modules', null, {})
	},
}
