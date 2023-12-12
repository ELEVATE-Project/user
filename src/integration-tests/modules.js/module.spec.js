const commonHelper = require('@commonTests')
const schema = require('./responseSchema')

describe('mentoring/v1/modules ', function () {
	let userDetails
	beforeAll(async () => {
		userDetails = await commonHelper.mentorLogIn()
	})
	it('/create', async () => {
		let res = await request.post('/mentoring/v1/modules/create').send({
			code: 'system_admin',
		})
		//console.log(res.body)
		expect(res.statusCode).toBe(201)
		expect(res.body).toMatchSchema(schema.createSchema)
	})

	it('/update', async () => {
		let res = await request.post('/mentoring/v1/modules/update/3').send({
			code: 'ment',
		})
		//console.log(res.body)
		expect(res.statusCode).toBe(201)
		expect(res.body).toMatchSchema(schema.updateSchema)
	})

	it('/delete', async () => {
		let res = await request.post('/mentoring/v1/modules/delete/4')
		//console.log(res.body)
		expect(res.statusCode).toBe(202)
		expect(res.body).toMatchSchema(schema.deleteSchema)
	})

	it('/list', async () => {
		let res = await request.get('/mentoring/v1/modules/list').query({ page: 1, limit: 10, code: 'cw==' })
		//console.log(res.body)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(schema.listSchema)
	})
})
