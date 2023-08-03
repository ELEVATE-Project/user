module.exports = {
	up: async (queryInterface, Sequelize) => {
		const entitiesArray = {
			location: [
				{
					value: 'AP',
					label: 'Andhra Pradesh',
				},
				{
					value: 'AR',
					label: 'Arunachal Pradesh',
				},
				{
					value: 'As',
					label: 'Assam',
				},
				{
					value: 'BR',
					label: 'Bihar',
				},
				{
					value: 'CG',
					label: 'Chhattisgarh',
				},
				{
					value: 'GA',
					label: 'Goa',
				},
				{
					value: 'GJ',
					label: 'Gujarat',
				},
				{
					value: 'HR',
					label: 'Haryana',
				},
				{
					value: 'HP',
					label: 'Himachal Pradesh',
				},
				{
					value: 'JH',
					label: 'Jharkhand',
				},
				{
					value: 'KN',
					label: 'Karnataka',
				},
				{
					value: 'KL',
					label: 'Kerala',
				},
				{
					value: 'MP',
					label: 'Madhya Pradesh',
				},
				{
					value: 'MH',
					label: 'Maharashtra',
				},
				{
					value: 'MN',
					label: 'Manipur',
				},
				{
					value: 'ML',
					label: 'Meghalaya',
				},
				{
					value: 'MZ',
					label: 'Mizoram',
				},
				{
					value: 'NL',
					label: 'Nagaland',
				},
				{
					value: 'OD',
					label: 'Odisha',
				},
				{
					value: 'PB',
					label: 'Punjab',
				},
				{
					value: 'RJ',
					label: 'Rajasthan',
				},
				{
					value: 'SK',
					label: 'Sikkim',
				},
				{
					value: 'TN',
					label: 'Tamil Nadu',
				},
				{
					value: 'TS',
					label: 'Telangana',
				},
				{
					value: 'TR',
					label: 'Tripura',
				},
				{
					value: 'UP',
					label: 'Uttar Pradesh',
				},
				{
					value: 'UK',
					label: 'Uttarakhand',
				},
				{
					value: 'WB',
					label: 'West Bengal',
				},
			],
			languages: [
				{
					value: 'english',
					label: 'English',
				},
				{
					value: 'hindi',
					label: 'Hindi',
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
				status: 'active',
				data_type: 'string',
				allow_filtering: true,
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
					eachEntity.status = 'active'
					eachEntity.type = 'system'
					eachEntity.created_at = new Date()
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

function toCamelCase(key) {
	return key
		.split(' ')
		.map((a) => a.trim())
		.map((a) => a[0].toUpperCase() + a.substring(1))
		.join('')
}
