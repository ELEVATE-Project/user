module.exports = {
	up: async (queryInterface, Sequelize) => {
		const defaultOrgId = queryInterface.sequelize.options.defaultOrgId
		if (!defaultOrgId) {
			throw new Error('Default org ID is undefined. Please make sure it is set in sequelize options.')
		}
		const entitiesArray = {
			medium: [
				{
					label: 'English',
					value: 'en_in',
				},
				{
					label: 'Hindi',
					value: 'hi',
				},
			],
			recommended_for: [
				{
					value: 'deo',
					label: 'District education officer',
				},
				{
					value: 'beo',
					label: 'Block education officer',
				},
				{
					value: 'hm',
					label: 'Head master',
				},
				{
					value: 'te',
					label: 'Teacher',
				},
				{
					value: 'co',
					label: 'Cluster officials',
				},
			],
			categories: [
				{
					value: 'educational_leadership',
					label: 'Educational leadership',
				},
				{
					value: 'school_process',
					label: 'School process',
				},
				{
					value: 'communication',
					label: 'Communication',
				},
				{
					value: 'sqaa',
					label: 'SQAA',
				},
				{
					value: 'professional_development',
					label: 'Professional development',
				},
			],
			area_of_expertise: [
				{
					value: 'educational_leadership',
					label: 'Educational leadership',
				},
				{
					value: 'school_process',
					label: 'School process',
				},
				{
					value: 'communication',
					label: 'Communication',
				},
				{
					value: 'sqaa',
					label: 'SQAA',
				},
				{
					value: 'professional_development',
					label: 'Professional development',
				},
			],
			designation: [
				{
					value: 'deo',
					label: 'District education officer',
				},
				{
					value: 'beo',
					label: 'Block education officer',
				},
				{
					value: 'hm',
					label: 'Head master',
				},
				{
					value: 'te',
					label: 'Teacher',
				},
				{
					value: 'co',
					label: 'Cluster officials',
				},
			],
		}

		const sessionEntityTypes = ['recommended_for', 'categories', 'medium']

		const entityTypeFinalArray = Object.keys(entitiesArray).map((key) => {
			const entityTypeRow = {
				value: key,
				label: convertToWords(key),
				data_type: 'ARRAY[STRING]',
				status: 'ACTIVE',
				updated_at: new Date(),
				created_at: new Date(),
				created_by: 0,
				updated_by: 0,
				allow_filtering: true,
				organization_id: defaultOrgId,
				has_entities: true,
			}

			// Check if the key is in sessionEntityTypes before adding model_names
			if (sessionEntityTypes.includes(key)) {
				entityTypeRow.model_names = ['Session']
			} else {
				entityTypeRow.model_names = ['MentorExtension', 'UserExtension']
			}
			if (key === 'location') {
				entityTypeRow.allow_custom_entities = false
			} else {
				entityTypeRow.allow_custom_entities = true
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
