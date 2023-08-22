module.exports = {
	up: async (queryInterface, Sequelize) => {
		const entitiesArray = {
			medium: [
				{
					label: 'English',
					value: '1',
				},
				{
					label: 'Hindi',
					value: '2',
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
					value: 'TE',
					label: 'Teacher',
				},
				{
					value: 'CO',
					label: 'Cluster officials',
				},
			],
			categories: [
				{
					value: 'Educational leadership',
					label: 'Educational leadership',
				},
				{
					value: 'School process',
					label: 'School process',
				},
				{
					value: 'Communication',
					label: 'Communication',
				},
				{
					value: 'SQAA',
					label: 'SQAA',
				},
				{
					value: 'Professional development',
					label: 'Professional development',
				},
			],
		}

		let entitiesFinalArray = []
		let entityTypeFinalArray = []
		let entityTypeValues = []
		entityTypeValues = [...Object.keys(entitiesArray)]

		Object.keys(entitiesArray).forEach((key) => {
			let eachentityTypeRow = {
				value: key,
				label: toCamelCase(key),
				data_type: 'STRING',
				status: 'ACTIVE',
				updated_at: new Date(),
				created_at: new Date(),
			}

			entityTypeFinalArray.push(eachentityTypeRow)
		})

		await queryInterface.bulkInsert('entity_types', entityTypeFinalArray, {})

		const entityTypes = await queryInterface.sequelize.query('SELECT * FROM entity_types', {
			type: queryInterface.sequelize.QueryTypes.SELECT,
		})

		entityTypes.forEach((eachTypes) => {
			if (eachTypes.value in entitiesArray) {
				entitiesArray[eachTypes.value].forEach((eachEntity) => {
					eachEntity.entity_type_id = eachTypes.id
					;(eachEntity.type = 'SYSTEM'), (eachEntity.status = 'ACTIVE'), (eachEntity.created_at = new Date())
					eachEntity.updated_at = new Date()

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

function toCamelCase(inputString) {
	const cleanedString = inputString.replace(/[^a-zA-Z0-9\s]/g, ' ')
	const words = cleanedString.split(/\s+/)
	const camelCasedWords = words.map((word, index) => {
		if (index === 0) {
			return word.toLowerCase()
		}
		return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
	})
	const camelCaseString = camelCasedWords.join('')
	return camelCaseString
}
