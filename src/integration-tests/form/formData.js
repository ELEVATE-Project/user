const formsData = require('@db/forms/queries')
const { faker } = require('@faker-js/faker')

let bodyData

const insertForm = async () => {
	try {
		const [type, subType, action] = [faker.random.alpha(5), faker.random.alpha(5), faker.random.alpha(5)]
		bodyData = {
			type: type,
			subType: subType,
			action: action,
			data: {
				templateName: 'defaultTemplate',
				fields: {
					controls: [
						{
							name: 'categories',
							label: 'Select categories',
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
		await formsData.createForm(bodyData)
		const form = await formsData.findOneForm({
			type: type,
			subType: subType,
			action: action,
			templateName: 'defaultTemplate',
		})
		return form._id.valueOf()
	} catch (error) {
		console.error(error)
	}
}

module.exports = {
	insertForm,
}
