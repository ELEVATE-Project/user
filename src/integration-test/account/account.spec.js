/**
 * name : account.spec.js
 * author : Nevil
 * created-date : 28-Sep-2022
 * Description : Integration test for account controllers.
 */

const { request, logIn, logError } = require('@commonTests')
let responseSchema = require('./responseSchema')
const { faker } = require('@faker-js/faker')
const { insertUser } = require('./accountData')

describe('/user/v1/account', function () {
	let userEmail
	let userDetails
	let password
	beforeAll(async () => {
		userDetails = await logIn()
		userEmail = faker.internet.email()
		password = faker.internet.password()
	})

	it('/create', async () => {
		let res = await request.post('/user/v1/account/create').send({
			name: 'Nevil',
			email: userEmail,
			password: password,
			isAMentor: false,
		})

		logError(res)
		expect(res.statusCode).toBe(201)
		expect(res.body).toMatchSchema(responseSchema.createProfileSchema)
	})
	it('/login', async () => {
		let insertedUserDetails = await insertUser()
		let res = await request.post('/user/v1/account/login').send({
			email: insertedUserDetails.email,
			password: insertedUserDetails.password,
		})

		logError(res)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(responseSchema.loginSchema)
	})

	it('/verifyMentor', async () => {
		let res = await request.get('/user/v1/account/verifyMentor').query({ userId: userDetails.userId })

		logError(res)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(responseSchema.verifyMentor)
	})

	it('/verifyUser', async () => {
		let res = await request.get('/user/v1/account/verifyUser').query({ userId: userDetails.userId })

		logError(res)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(responseSchema.verifyUser)
	})

	it('/acceptTermsAndCondition', async () => {
		let res = await request.patch('/user/v1/account/acceptTermsAndCondition')

		logError(res)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(responseSchema.acceptTermsAndConditionSchema)
	})
	it('/list', async () => {
		let res = await request.patch('/user/v1/account/list').query({ type: 'mentee', page: 1, limit: 2 })

		logError(res)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(responseSchema.listSchema)
	})
	it('/generateToken', async () => {
		let res = await request
			.post('/user/v1/account/generateToken')
			.query({ type: 'mentee', page: 1, limit: 2 })
			.send({
				refreshToken: userDetails.refreshToken,
			})

		logError(res)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(responseSchema.generateTokenSchema)
	})
	it('/changeRole', async () => {
		let res = await request.post('/user/v1/account/changeRole').send({
			email: userDetails.email,
		})
		userDetails = await logIn()

		logError(res)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(responseSchema.changeRoleSchema)
	})
	it('/logout', async () => {
		let res = await request.post('/user/v1/account/logout').send({
			refreshToken: userDetails.refreshToken,
		})
		logError(res)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(responseSchema.logoutSchema)
	})
})
