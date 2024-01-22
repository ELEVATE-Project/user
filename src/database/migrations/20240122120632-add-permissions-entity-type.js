'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		try {
			const permissionsData = [
				{
					code: 'read_all_entity_types',
					module: 'entity-type',
					request_type: ['POST'],
					api_path: '/mentoring/v1/entity-type/read',
					status: 'ACTIVE',
					created_at: new Date(),
					updated_at: new Date(),
				},
				{
					code: 'read_entity_types',
					module: 'entity-type',
					request_type: ['POST'],
					api_path: '/mentoring/v1/entity-type/read/:id',
					status: 'ACTIVE',
					created_at: new Date(),
					updated_at: new Date(),
				},
				{
					code: 'create_entity_types',
					module: 'entity-type',
					request_type: ['POST'],
					api_path: '/mentoring/v1/entity-type/create',
					status: 'ACTIVE',
					created_at: new Date(),
					updated_at: new Date(),
				},
				{
					code: 'update_entity_types',
					module: 'entity-type',
					request_type: ['POST'],
					api_path: '/mentoring/v1/entity-type/update/:id',
					status: 'ACTIVE',
					created_at: new Date(),
					updated_at: new Date(),
				},
				{
					code: 'delete_entity_types',
					module: 'entity-type',
					request_type: ['DELETE'],
					api_path: '/mentoring/v1/entity-type/delete/:id',
					status: 'ACTIVE',
					created_at: new Date(),
					updated_at: new Date(),
				},
			]
			await queryInterface.bulkInsert('permissions', permissionsData)
		} catch (error) {
			console.log(error)
		}
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('permissions', {
			code: [
				'read_all_entity_types',
				'read_entity_types',
				'create_entity_types',
				'update_entity_types',
				'delete_entity_types',
			],
		})
	},
}
