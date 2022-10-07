const formsData = require('@db/forms/queries')
const { faker } = require('@faker-js/faker')
let bodyData
let formBody = {
	subType: 'profileForm',
	action: 'profileFields',
	ver: '1.0',
	data: {
		templateName: 'defaultTemplate',
		fields: {
			controls: [
				{
					name: 'name',
					label: 'name',
					value: '',
					class: 'ion-margin',
					type: 'text',
					position: 'floating',
					validators: {
						required: true,
						minLength: 10,
					},
				},
				{
					name: 'roles',
					label: 'Select your role',
					value: '',
					class: 'ion-margin',
					type: 'chip',
					position: '',
					disabled: false,
					showSelectAll: true,
					validators: {
						required: true,
					},
				},
			],
		},
	},
}

const insertForm = async () => {
	try {
		let type = faker.random.alpha(5)
		bodyData = {
			type: type,
			...formBody,
		}

		await formsData.createForm(bodyData)

		return type
	} catch (error) {
		console.error(error)
	}
}

module.exports = {
	insertForm,
	formBody,
}
