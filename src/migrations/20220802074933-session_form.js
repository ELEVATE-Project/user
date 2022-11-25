module.exports = {
	async up(db) {
		global.migrationMsg = 'Session Form Created'

		const form = await db.collection('forms').findOne({ type: 'session' })
		if (!form) {
			const categories = await db
				.collection('entities')
				.find(
					{ type: 'categories', status: 'ACTIVE', deleted: false },
					{ projection: { value: 1, label: 1, image: 1, _id: 0 } }
				)
				.toArray()

			const controls = [
				{
					name: 'title',
					label: 'Session Title',
					type: 'text',
					position: 'floating',
				},
				{
					name: 'description',
					label: 'Description',
					type: 'textarea',
					position: 'floating',
				},
				{
					name: 'startDate',
					label: 'Start Date',
					displayFormat: 'DD/MMM/YYYY HH:mm',
					dependedChild: 'endDate',
					type: 'date',
					position: 'floating',
				},
				{
					name: 'endDate',
					label: 'End Date',
					displayFormat: 'DD/MMM/YYYY HH:mm',
					type: 'date',
					position: 'floating',
				},
				{
					name: 'recommendedFor',
					label: 'Recommended For',
					type: 'chip',
					disabled: false,
					showSelectAll: true,
					showAddOption: true,
					optionsUrl: { url: 'roles/search', method: 'POST' },
					options: [
						{ value: 'deo', label: 'District education officer' },
						{ value: 'beo', label: 'Block education officer' },
						{ value: 'hm', label: 'Head Master' },
						{ value: 'TE', label: 'Teacher' },
						{ value: 'CO', label: 'Cluster Officials' },
					],
				},
				{
					name: 'categories',
					label: 'Categories',
					type: 'chip',
					disabled: false,
					showSelectAll: true,
					showAddOption: true,
					options: categories,
				},
				{
					name: 'medium',
					label: 'Select Medium',
					type: 'chip',
					disabled: false,
					showSelectAll: true,
					showAddOption: true,
					options: [
						{ label: 'English', value: '1' },
						{ label: 'Hindi', value: '2' },
					],
				},
			]
			const nullPosition = ['medium', 'categories', 'recommendedFor']
			controls.forEach((element) => {
				if (nullPosition.includes(element.name)) {
					element.position = ''
				} else {
					element.position = 'floating'
				}
				element.validators = { required: true }
				element.class = 'ion-margin'
				element.value = ''
			})

			let formsData = {
				type: 'session',
				subType: 'sessionForm',
				action: 'sessionFields',
				data: {
					templateName: 'defaultTemplate',
					fields: {
						controls: controls,
					},
				},
				__v: 0,
			}
			await db.collection('forms').insertOne(formsData)
		}
	},

	async down(db) {
		const form = await db.collection('forms').findOne({ type: 'session' })
		if (form) {
			await db.collection('forms').deleteOne({ type: 'session' })
		}
	},
}
