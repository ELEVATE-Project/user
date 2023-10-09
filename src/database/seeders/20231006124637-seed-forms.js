module.exports = {
	up: async (queryInterface, Sequelize) => {
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
			designation: [
				{
					value: 'teacher',
					label: 'Teacher',
				},
				{
					value: 'hm',
					label: 'Head Master',
				},
			],
		}

		const sessionEntityTypes = ['recommended_for', 'categories', 'medium']
		const entityTypeFinalArray = Object.keys(entitiesArray).map((key) => {
			const entityTypeRow = {
				value: key,
				label: toCamelCase(key),
				data_type: 'STRING',
				status: 'ACTIVE',
				updated_at: new Date(),
				created_at: new Date(),
				created_by: 0,
				allow_filtering: true,
				org_id: 1,
			}

			// Check if the key is in sessionEntityTypes before adding model_names
			if (sessionEntityTypes.includes(key)) {
				entityTypeRow.model_names = ['sessions']
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

function toCamelCase(inputString) {
	return inputString
		.replace(/_/g, ' ')
		.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
			return index === 0 ? word.toLowerCase() : word.toUpperCase()
		})
		.replace(/\s+/g, '')
}
