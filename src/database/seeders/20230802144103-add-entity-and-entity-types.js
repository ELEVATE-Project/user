module.exports = {
	up: async (queryInterface, Sequelize) => {
		const defaultOrgId = queryInterface.sequelize.options.defaultOrgId
		if (!defaultOrgId) {
			throw new Error('Default org ID is undefined. Please make sure it is set in sequelize options.')
		}
		const entitiesArray = {
			languages: [
				{
					label: 'English',
					value: 'en_in',
				},
				{
					label: 'Hindi',
					value: 'hi',
				},
			],
			location: [
				{
					value: 'ap',
					label: 'Andhra Pradesh',
				},
				{
					value: 'ar',
					label: 'Arunachal Pradesh',
				},
				{
					value: 'as',
					label: 'Assam',
				},
				{
					value: 'br',
					label: 'Bihar',
				},
				{
					value: 'cg',
					label: 'Chhattisgarh',
				},
				{
					value: 'ga',
					label: 'Goa',
				},
				{
					value: 'gj',
					label: 'Gujarat',
				},
				{
					value: 'hr',
					label: 'Haryana',
				},
				{
					value: 'hp',
					label: 'Himachal Pradesh',
				},
				{
					value: 'jh',
					label: 'Jharkhand',
				},
				{
					value: 'kn',
					label: 'Karnataka',
				},
				{
					value: 'kl',
					label: 'Kerala',
				},
				{
					value: 'mp',
					label: 'Madhya Pradesh',
				},
				{
					value: 'mh',
					label: 'Maharashtra',
				},
				{
					value: 'mn',
					label: 'Manipur',
				},
				{
					value: 'ml',
					label: 'Meghalaya',
				},
				{
					value: 'mz',
					label: 'Mizoram',
				},
				{
					value: 'nl',
					label: 'Nagaland',
				},
				{
					value: 'od',
					label: 'Odisha',
				},
				{
					value: 'pb',
					label: 'Punjab',
				},
				{
					value: 'rj',
					label: 'Rajasthan',
				},
				{
					value: 'sk',
					label: 'Sikkim',
				},
				{
					value: 'tn',
					label: 'Tamil Nadu',
				},
				{
					value: 'ts',
					label: 'Telangana',
				},
				{
					value: 'tr',
					label: 'Tripura',
				},
				{
					value: 'up',
					label: 'Uttar Pradesh',
				},
				{
					value: 'uk',
					label: 'Uttarakhand',
				},
				{
					value: 'wb',
					label: 'West Bengal',
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
				model_names: ['User'],
			}

			if (key === 'location') {
				entityTypeRow.allow_custom_entities = false
				entityTypeRow.data_type = 'STRING'
			} else {
				entityTypeRow.allow_custom_entities = true
				entityTypeRow.data_type = 'ARRAY[STRING]'
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
