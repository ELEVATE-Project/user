/**
 * name : systemUser.spec.js
 * author : Nevil
 * created-date : 28-Sep-2022
 * Description : Integration test for systemUser controllers.
 */

const { request, logIn, adminLogIn, logError } = require('@commonTests')
const { createSystemUserSchema, loginSchema, addOrgAdminSchema, deactivateOrgSchema } = require('./responseSchema')
const { faker } = require('@faker-js/faker')
const { afterLogIn } = require('./systemUserData')

describe('user/v1/admin', function () {
	let userDetails
	let email = faker.internet.email()
	let password = faker.internet.password()
	beforeAll(async () => {
		userDetails = await logIn()
		adminDetails = await adminLogIn()
	})
	it('/create', async () => {
		let res = await request
			.post('/user/v1/admin/create')
			.set({
				internal_access_token: 'internal_access_token',
				Connection: 'keep-alive',
				'Content-Type': 'application/json',
			})
			.send({
				name: 'admin',
				email: email,
				password: password,
				secret_code: 'W5bF7gesuS0xsNWmpsKy',
			})

		logError(res)
		expect(res.statusCode).toBe(201)
		expect(res.body).toMatchSchema(createSystemUserSchema)
	})
	it('/login', async () => {
		let res = await request.post('/user/v1/admin/login').send({
			email: email,
			password: password,
		})

		logError(res)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(loginSchema)
	})
	it('/addOrgAdmin', async () => {
		let res = await request
			.post('/user/v1/admin/addOrgAdmin')
			.set({
				'X-auth-token': 'bearer ' + adminDetails.token,
			})
			.send({
				email: email,
				organization_id: 1,
			})

		logError(res)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(addOrgAdminSchema)
	})
	it('/deactivateOrg', async () => {
		const logInAfter = await afterLogIn(email, password)
		let res = await request
			.post('/user/v1/admin/deactivateOrg/1')
			.set({
				'X-auth-token': 'bearer ' + logInAfter.token,
			})
			.send({})

		logError(res)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(deactivateOrgSchema)
	})
})
