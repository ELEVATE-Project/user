'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		try {
			const permissionsData = [
				{
					code: 'organization_data_update',
					module: 'organization',
					request_type: ['POST'],
					api_path: 'user/v1/organization/update/*',
					status: 'ACTIVE',
				},
				{
					code: 'organization_append_relatedOrg',
					module: 'organization',
					request_type: ['POST'],
					api_path: 'user/v1/organization/addRelatedOrg/*',
					status: 'ACTIVE',
				},
				{
					code: 'organization_remove_relatedOrg',
					module: 'organization',
					request_type: ['POST'],
					api_path: 'user/v1/organization/removeRelatedOrg/*',
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
			// Rollback the batch insert
			await queryInterface.bulkDelete('permissions', {
				code: {
					[Sequelize.Op.in]: [
						'organization_data_update',
						'organization_append_relatedOrg',
						'organization_remove_relatedOrg',
					],
				},
			})
		} catch (error) {
			console.error('Error rolling back migration:', error)
			throw error
		}
	},
}
