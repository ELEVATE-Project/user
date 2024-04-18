/**
 * name : form.spec.js
 * author : Nevil
 * created-date : 28-Sep-2022
 * Description : Integration test for form controllers.
 */

const { formCreateSchema, formReadSchema, formUpdateSchema } = require('./responseSchema')
const { request, adminLogIn, logIn, logError } = require('@commonTests')
const { insertForm, formBody, insertMentor } = require('./formData')
const { faker } = require('@faker-js/faker')

describe('user/v1/form', function () {
	let type = faker.random.alpha(5)
	beforeAll(async () => {
		adminDetails = await adminLogIn()
		UserDetails = await logIn()
	})

	it('/create', async () => {
		let res = await request
			.post('/user/v1/form/create')
			.set('X-auth-token', 'bearer ' + adminDetails.token)
			.send({
				type: type,
				...formBody,
			})
		logError(res)
		expect(res.statusCode).toBe(201)
		expect(res.body).toMatchSchema(formCreateSchema)
	})
	it('/read', async () => {
		let type = await insertForm()
		let res = await request
			.post('/user/v1/form/read')
			.set('X-auth-token', 'bearer ' + UserDetails.token)
			.send({
				type: 'profile',
				sub_type: 'profileForm',
			})
		logError(res)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(formReadSchema)
	})
	it('/update', async () => {
		// let type = await insertForm()
		// console.log(type)
		let res = await request
			.post('/user/v1/form/update')
			.set('X-auth-token', 'bearer ' + adminDetails.token)
			.send({
				type: type,
				...formBody,
			})
		logError(res)
		expect(res.statusCode).toBe(202)
		expect(res.body).toMatchSchema(formUpdateSchema)
	})
})
