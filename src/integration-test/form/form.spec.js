/**
 * name : form.spec.js
 * author : Nevil
 * created-date : 28-Sep-2022
 * Description : Integration test for form controllers.
 */

const { request, logIn, logError } = require('@commonTests')
const { formCreateSchema, formReadSchema, formUpdateSchema } = require('./responseSchema')
const { insertForm, formBody } = require('./formData')
const { faker } = require('@faker-js/faker')

describe('user/v1/form', function () {
	beforeAll(async () => {
		await logIn()
	})
	it('/create', async () => {
		let res = await request.post('/user/v1/form/create').send({
			type: faker.random.alpha(5),
			...formBody,
		})
		logError(res)
		expect(res.statusCode).toBe(201)
		expect(res.body).toMatchSchema(formCreateSchema)
	})
	it('/read', async () => {
		let type = await insertForm()
		let res = await request.patch('/user/v1/form/read').send({
			type: type,
			subType: 'profileForm',
			action: 'profileFields',
			ver: '1.0',
			templateName: 'defaultTemplate',
		})
		logError(res)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(formReadSchema)
	})
	it('/update', async () => {
		let type = await insertForm()
		let res = await request.post('/user/v1/form/update').send({
			type: type,
			...formBody,
		})
		logError(res)
		expect(res.statusCode).toBe(202)
		expect(res.body).toMatchSchema(formUpdateSchema)
	})
})
