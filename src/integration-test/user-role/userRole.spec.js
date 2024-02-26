const { request, logIn, adminLogIn, logError } = require('@commonTests')
let responseSchema = require('./responseSchema')
const { faker } = require('@faker-js/faker')
const { insertUserRole } = require('./userRoleData')

describe('/user/v1/user-role', function () {
	let userDetails
	beforeAll(async () => {
		userDetails = await adminLogIn()
		insertRole = await insertUserRole()
	})

	it('/create', async () => {
		let name = faker.lorem.word().toLowerCase()
		let res = await request
			.post('/user/v1/user-role/create')
			.set({
				'X-auth-token': 'bearer ' + userDetails.token,
				Connection: 'keep-alive',
				'Content-Type': 'application/json',
			})
			.send({
				title: name,
				user_type: 1,
				status: 'ACTIVE',
				visibility: 'PUBLIC',
			})

		logError(res)
		expect(res.statusCode).toBe(201)
		expect(res.body).toMatchSchema(responseSchema.createSchema)
	})

	it('/update', async () => {
		let name = faker.lorem.word().toLowerCase()
		let res = await request
			.post('/user/v1/user-role/update/' + insertRole[0])
			.set({
				'X-auth-token': 'bearer ' + insertRole[1],
				Connection: 'keep-alive',
				'Content-Type': 'application/json',
			})
			.send({
				title: name,
				user_type: 1,
				status: 'ACTIVE',
				visibility: 'PUBLIC',
			})

		logError(res)
		expect(res.statusCode).toBe(201)
		expect(res.body).toMatchSchema(responseSchema.updateSchema)
	})

	it('/delete', async () => {
		let res = await request.post('/user/v1/user-role/delete/' + insertRole[0]).set({
			'X-auth-token': 'bearer ' + insertRole[1],
			Connection: 'keep-alive',
			'Content-Type': 'application/json',
		})

		logError(res)
		expect(res.statusCode).toBe(202)
		expect(res.body).toMatchSchema(responseSchema.deleteSchema)
	})

	it('/list', async () => {
		let res = await request
			.get('/user/v1/user-role/list')
			.set({
				'X-auth-token': 'bearer ' + userDetails.token,
				Connection: 'keep-alive',
				'Content-Type': 'application/json',
			})
			.query({ page: 1, limit: 10, search: 'user' })

		logError(res)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(responseSchema.listSchema)
	})

	it('/default', async () => {
		let res = await request
			.get('/user/v1/user-role/default')
			.set({
				internal_access_token: 'internal_access_token',
			})
			.query({ page: 1, limit: 10 })

		logError(res)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(responseSchema.listSchema)
	})
})
