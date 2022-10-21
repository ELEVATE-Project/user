/**
 * name : form.spec.js
 * author : Nevil
 * created-date : 16-Oct-2022
 * Description : Integration test for form controllers.
 */

const commonHelper = require('@commonTests')
const { faker } = require('@faker-js/faker')
const formData = require('./formData')
const schema = require('./responseSchema')

describe('mentoring/v1/form', function () {
	beforeAll(async () => {
		await commonHelper.logIn()
	})
	it('/create', async () => {
		let res = await request.post('/mentoring/v1/form/create').send({
			type: faker.random.alpha(5),
			subType: faker.random.alpha(5),
			action: faker.random.alpha(5),
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
		})
		//console.dir(res.body)
		expect(res.statusCode).toBe(201)
		expect(res.body).toMatchSchema(schema.createSchema)
	})
	it('/read', async () => {
		let formId = await formData.insertForm()
		let res = await request.get('/mentoring/v1/form/read/' + formId)

		//console.log(res.body)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(schema.readSchema)
	})
	it('/update', async () => {
		let entityId = await formData.insertForm()
		let res = await request.post('/mentoring/v1/form/update/' + entityId).send({
			type: faker.random.alpha(5),
			subType: faker.random.alpha(5),
			action: faker.random.alpha(5),
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
		})
		//console.log(res.body)
		expect(res.statusCode).toBe(202)
		expect(res.body).toMatchSchema(schema.updateSchema)
	})
})
