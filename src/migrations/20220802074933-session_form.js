const endpoints = require('../constants/endpoints')
const request = require('request')
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

			let formsData = {
				type: 'session',
				subType: 'sessionForm',
				action: 'sessionFields',
				ver: '1.0',
				data: {
					templateName: 'defaultTemplate',
					fields: {
						controls: [
							{
								name: 'title',
								label: 'Session Title',
								value: '',
								class: 'ion-margin',
								type: 'text',
								position: 'floating',
								validators: { required: true },
							},
							{
								name: 'description',
								label: 'Description',
								value: '',
								class: 'ion-margin',
								type: 'textarea',
								position: 'floating',
								validators: { required: true },
							},
							{
								name: 'startDate',
								label: 'Start Date',
								class: 'ion-margin',
								value: '',
								displayFormat: 'DD/MMM/YYYY HH:mm',
								dependedChild: 'endDate',
								type: 'date',
								position: 'floating',
								validators: { required: true },
							},
							{
								name: 'endDate',
								label: 'End Date',
								class: 'ion-margin',
								value: '',
								displayFormat: 'DD/MMM/YYYY HH:mm',
								type: 'date',
								position: 'floating',
								validators: { required: true },
							},
							{
								name: 'recommendedFor',
								label: 'Recommended For',
								class: 'ion-margin',
								value: '',
								type: 'chip',
								position: '',
								disabled: false,
								showSelectAll: true,
								showAddOption: true,
								validators: { required: true },
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
								class: 'ion-margin',
								value: '',
								type: 'chip',
								position: '',
								disabled: false,
								showSelectAll: true,
								showAddOption: true,
								validators: { required: true },
								options: categories,
							},
							{
								name: 'medium',
								label: 'Select Medium',
								class: 'ion-margin',
								value: '',
								type: 'chip',
								position: '',
								disabled: false,
								showSelectAll: true,
								showAddOption: true,
								validators: { required: true },
								options: [
									{ label: 'English', value: '1' },
									{ label: 'Hindi', value: '2' },
								],
							},
						],
					},
				},
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
