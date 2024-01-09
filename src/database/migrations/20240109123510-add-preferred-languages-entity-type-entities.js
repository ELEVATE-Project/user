'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		const defaultOrgId = queryInterface.sequelize.options.defaultOrgId
		await queryInterface.bulkInsert(
			'entity_types',
			[
				{
					value: 'preferred_language',
					label: 'Preferred Language',
					created_by: 0,
					updated_by: 0,
					allow_filtering: true,
					data_type: 'STRING',
					organization_id: defaultOrgId,
					parent_id: null,
					allow_custom_entities: false,
					has_entities: true,
					model_names: ['User'],
					created_at: new Date(),
					updated_at: new Date(),
				},
			],
			{}
		)
		const [preferredLanguageEntityType] = await queryInterface.sequelize.query(
			"SELECT id FROM entity_types WHERE value = 'preferred_language'"
		)
		const preferredLanguageEntityTypeId = preferredLanguageEntityType[0].id
		await queryInterface.bulkInsert(
			'entities',
			[
				{
					entity_type_id: preferredLanguageEntityTypeId,
					value: 'en',
					label: 'English',
					status: 'ACTIVE',
					type: 'SYSTEM',
					created_by: 0,
					updated_by: 0,
					created_at: new Date(),
					updated_at: new Date(),
				},
				{
					entity_type_id: preferredLanguageEntityTypeId,
					value: 'hi',
					label: 'Hindi',
					status: 'ACTIVE',
					type: 'SYSTEM',
					created_by: 0,
					updated_by: 0,
					created_at: new Date(),
					updated_at: new Date(),
				},
			],
			{}
		)
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('entities', { value: ['en', 'hi'] })
		await queryInterface.bulkDelete('entity_types', { value: 'preferred_language' })
	},
}
