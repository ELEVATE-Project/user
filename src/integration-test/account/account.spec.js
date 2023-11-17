/**
 * name : account.spec.js
 * author : Nevil
 * created-date : 28-Sep-2022
 * Description : Integration test for account controllers.
 */

const { request, logIn, logError } = require('@commonTests')
let responseSchema = require('./responseSchema')
const { faker } = require('@faker-js/faker')
const { insertUser, redisConnection } = require('./accountData')
const utilsHelper = require('@generics/utils')
const timeOutValue = 50000

describe('/user/v1/account', function () {
	let userEmail
	let userDetails
	let password
	beforeAll(async () => {
		userDetails = await logIn()
		userEmail = await faker.internet.email()
		password = await faker.internet.password()
		console.log('User Email : ', userEmail)
	}, timeOutValue)

	it(
		'/create',
		async () => {
			let res = await request.post('/user/v1/account/create').send({
				name: 'Nevil',
				email: userEmail,
				password: password,
				isAMentor: false,
			})
			logError(res)
			expect(res.statusCode).toBe(201)
			expect(res.body).toMatchSchema(responseSchema.createProfileSchema)
		},
		timeOutValue
	)
	it('/login', async () => {
		let insertedUserDetails = await insertUser()
		let res = await request.post('/user/v1/account/login').send({
			email: userEmail,
			password: password,
		})
		logError(res)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(responseSchema.loginSchema)
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

	it(
		'/generateDisableOTP',
		async () => {
			let res = await request.post('/user/v1/account/generateDisableOtp').send({
				email: userEmail.toLowerCase(),
			})
			logError(res)
			// console.log("res = > ",res)
			expect(res.statusCode).toBe(201)
			expect(res.body).toMatchSchema(responseSchema.generateDisableOTP)
		},
		timeOutValue
	)
	it('/disableUser', async () => {
		let otp = process.env.PRE_SET_OTP
		let res = await request.post('/user/v1/account/deactivate').send({
			email: userEmail.toLowerCase(),
			otp: otp,
		})
		logError(res)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(responseSchema.disableUser)
	})
})
