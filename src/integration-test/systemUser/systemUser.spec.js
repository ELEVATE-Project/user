/**
 * name : systemUser.spec.js
 * author : Nevil
 * created-date : 28-Sep-2022
 * Description : Integration test for systemUser controllers.
 */

const { request, logIn, logError } = require('@commonTests')
const { createSystemUserSchema, loginSchema } = require('./responseSchema')
const { faker } = require('@faker-js/faker')

const { insertAdminUser } = require('./systemUserData')

describe('user/v1/systemUsers', function () {
	let userDetails

	beforeAll(async () => {
		userDetails = await logIn()
	})
	it('/create', async () => {
		let res = await request.post('/user/v1/systemUsers/create').send({
			name: 'admin',
			email: faker.internet.email(),
			password: faker.internet.password(),
			role: 'admin',
			secretCode: 'W5bF7gesuS0xsNWmpsKy',
		})

		logError(res)
		expect(res.statusCode).toBe(201)
		expect(res.body).toMatchSchema(createSystemUserSchema)
	})
	it('/login', async () => {
		let adminDetails = await insertAdminUser()
		let res = await request.post('/user/v1/systemUsers/login').send({
			email: adminDetails.email,
			password: adminDetails.password,
		})

		logError(res)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(loginSchema)
	})
})
