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
		let res = await request.post('/user/v1/account/login').send({
			email: userEmail,
			password: password,
		})
		logError(res)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(responseSchema.loginSchema)
	})

	it('/acceptTermsAndCondition', async () => {
		let res = await request.patch('/user/v1/account/acceptTermsAndCondition')

		logError(res)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(responseSchema.acceptTermsAndConditionSchema)
	})

	it('/generateToken', async () => {
		let res = await request
			.post('/user/v1/account/generateToken')
			.query({ type: 'mentee', page: 1, limit: 2 })
			.send({
				refresh_token: userDetails.refreshToken,
			})

		logError(res)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(responseSchema.generateTokenSchema)
	})

	it('/logout', async () => {
		let res = await request.post('/user/v1/account/logout').send({
			refresh_token: userDetails.refreshToken,
		})
		logError(res)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(responseSchema.logoutSchema)
	})

	// search , changerole , verifyMentor , verifyuser doesn't have permissions and it is used in rolevalidation

	// it('/search', async () => {
	// 	console.log(userDetails.userId)
	// 	let res = await request.post('/user/v1/account/search')
	// 	.set({
	// 		'internal_access_token': 'internal_access_token',
	// 		Connection: 'keep-alive',
	// 		'Content-Type': 'application/json',
	// 	})
	// 	.send({
	// 		userIds : [456]
	// 	})

	// 	logError(res)
	// 	expect(res.statusCode).toBe(200)
	// 	console.log("listr ======",res.body)
	// 	expect(res.body).toMatchSchema(responseSchema.listSchema)
	// })

	// it('/changeRole', async () => {
	// 	let res = await request.post('/user/v1/account/changeRole').send({
	// 		email: userDetails.email,
	// 		role : 'mentor'
	// 	})
	// 	userDetails = await logIn()

	// 	logError(res)
	// 	expect(res.statusCode).toBe(200)
	// 	expect(res.body).toMatchSchema(responseSchema.changeRoleSchema)
	// })

	// it('/verifyMentor', async () => {
	// 	console.log(userDetails)
	// 	let res = await request.get('/user/v1/account/verifyMentor').query({ userId: userDetails.userId })

	// 	logError(res)
	// 	expect(res.statusCode).toBe(200)
	// 	expect(res.body).toMatchSchema(responseSchema.verifyMentor)
	// })

	// it('/verifyUser', async () => {
	// 	let res = await request.get('/user/v1/account/verifyUser').query({ userId: userDetails.userId })

	// 	logError(res)
	// 	expect(res.statusCode).toBe(200)
	// 	expect(res.body).toMatchSchema(responseSchema.verifyUser)
	// })
})
