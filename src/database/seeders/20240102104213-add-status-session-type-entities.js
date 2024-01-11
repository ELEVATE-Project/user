module.exports = {
	up: async (queryInterface, Sequelize) => {
		const defaultOrgId = queryInterface.sequelize.options.defaultOrgId
		if (!defaultOrgId) {
			throw new Error('Default org ID is undefined. Please make sure it is set in sequelize options.')
		}
		const entitiesArray = {
			type: [
				{
					label: 'Public',
					value: 'PUBLIC',
				},
				{
					label: 'Private',
					value: 'PRIVATE',
				},
			],
			status: [
				{
					value: 'Completed',
					label: 'COMPLETED',
				},
				{
					value: 'Unfulfilled',
					label: 'UNFULFILLED',
				},
				{
					value: 'Published',
					label: 'PUBLISHED',
				},
				{
					value: 'Live',
					label: 'LIVE',
				},
				{
					value: 'Active',
					label: 'ACTIVE',
				},
				{
					value: 'Inactive',
					label: 'INACTIVE',
				},
			],
		}

		const entityTypeFinalArray = Object.keys(entitiesArray).map((key) => {
			const entityTypeRow = {
				value: key,
				label: convertToWords(key),
				data_type: 'STRING',
				status: 'ACTIVE',
				updated_at: new Date(),
				created_at: new Date(),
				created_by: 0,
				updated_by: 0,
				allow_filtering: true,
				organization_id: defaultOrgId,
				has_entities: true,
				model_names: ['Session'],
				allow_custom_entities: false,
			}

			return entityTypeRow
		})

		await queryInterface.bulkInsert('entity_types', entityTypeFinalArray, {})

		const entityTypes = await queryInterface.sequelize.query('SELECT * FROM entity_types', {
			type: queryInterface.sequelize.QueryTypes.SELECT,
		})

		const entitiesFinalArray = []

		entityTypes.forEach((eachType) => {
			if (eachType.value in entitiesArray) {
				entitiesArray[eachType.value].forEach((eachEntity) => {
					eachEntity.entity_type_id = eachType.id
					eachEntity.type = 'SYSTEM'
					eachEntity.status = 'ACTIVE'
					eachEntity.created_at = new Date()
					eachEntity.updated_at = new Date()
					eachEntity.created_by = 0

					entitiesFinalArray.push(eachEntity)
				})
			}
		})

		await queryInterface.bulkInsert('entities', entitiesFinalArray, {})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('entity_types', null, {})
		await queryInterface.bulkDelete('entities', null, {})
	},
}

function convertToWords(inputString) {
	const words = inputString.replace(/_/g, ' ').split(' ')

	const capitalizedWords = words.map((word) => {
		return word.charAt(0).toUpperCase() + word.slice(1)
	})

	const result = capitalizedWords.join(' ')

	return result
}
