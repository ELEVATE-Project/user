'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		try {
			const permissionsData = [
				{
					code: 'get_user_sessions',
					module: 'account',
					request_type: ['GET'],
					api_path: '/user/v1/account/sessions',
					status: 'ACTIVE',
				},
				{
					code: 'validate_user_sessions',
					module: 'account',
					request_type: ['POST'],
					api_path: '/user/v1/account/validateUserSession',
					status: 'ACTIVE',
				},
			]

			// Batch insert permissions
			await queryInterface.bulkInsert(
				'permissions',
				permissionsData.map((permission) => ({
					...permission,
					created_at: new Date(),
					updated_at: new Date(),
				}))
			)
		} catch (error) {
			console.error('Error in migration:', error)
			throw error
		}
	},

	async down(queryInterface, Sequelize) {
		try {
			// Rollback migration by deleting all permissions
			await queryInterface.bulkDelete('permissions', null, {})
		} catch (error) {
			console.error('Error in rollback migration:', error)
			throw error
		}
	},
}
