'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		try {
			const permissionsData = [
				{
					code: 'read_entities',
					module: 'entity',
					request_type: ['POST'],
					api_path: '/mentoring/v1/entity/read',
					status: 'ACTIVE',
					created_at: new Date(),
					updated_at: new Date(),
				},
				{
					code: 'read_entities_by_id',
					module: 'entity',
					request_type: ['POST'],
					api_path: '/mentoring/v1/entity/read/:id',
					status: 'ACTIVE',
					created_at: new Date(),
					updated_at: new Date(),
				},
				{
					code: 'create_entities',
					module: 'entity',
					request_type: ['POST'],
					api_path: '/mentoring/v1/entity/create',
					status: 'ACTIVE',
					created_at: new Date(),
					updated_at: new Date(),
				},
				{
					code: 'update_entities',
					module: 'entity',
					request_type: ['PUT'],
					api_path: '/mentoring/v1/entity/update/:id',
					status: 'ACTIVE',
					created_at: new Date(),
					updated_at: new Date(),
				},
				{
					code: 'delete_entities',
					module: 'entity',
					request_type: ['DELETE'],
					api_path: '/mentoring/v1/entity/delete/:id',
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
			code: ['read_entities', 'create_entities', 'update_entities', 'delete_entities', 'read_entities_by_id'],
		})
	},
}
