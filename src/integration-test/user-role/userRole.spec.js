const { request, logIn, logError } = require('@commonTests')
let responseSchema = require('./responseSchema')

describe('/user/v1/user-role', function () {
	let userDetails
	beforeAll(async () => {
		userDetails = await logIn()
	})

	it('/create', async () => {
		let res = await request.post('/user/v1/user-role/create').send({
			title: 'system_admin',
			user_type: 1,
			status: 'ACTIVE',
			visibility: 'PUBLIC',
			organization_id: 1,
		})

		logError(res)
		expect(res.statusCode).toBe(201)
		expect(res.body).toMatchSchema(responseSchema.createSchema)
	})

	it('/update', async () => {
		let res = await request.post('/user/v1/user-role/update/7').send({
			title: 'system_adm',
			user_type: 1,
			status: 'ACTIVE',
			visibility: 'PUBLIC',
			organization_id: 1,
		})

		logError(res)
		expect(res.statusCode).toBe(201)
		expect(res.body).toMatchSchema(responseSchema.updateSchema)
	})

	it('/delete', async () => {
		let res = await request.post('/user/v1/user-role/delete/7')

		logError(res)
		expect(res.statusCode).toBe(202)
		expect(res.body).toMatchSchema(responseSchema.deleteSchema)
	})

	it('/list', async () => {
		let res = await request
			.get('/user/v1/user-role/list')
			.query({ page: 1, limit: 10, code: 'system', organization_id: 1 })

		logError(res)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(responseSchema.listSchema)
	})

	it('/default', async () => {
		let res = await request
			.get('/user/v1/user-role/default')
			.query({ page: 1, limit: 10, code: 'system', organization_id: 1 })

		logError(res)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(responseSchema.listSchema)
	})
})
