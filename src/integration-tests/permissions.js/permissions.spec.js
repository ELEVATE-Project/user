const commonHelper = require('@commonTests')
const schema = require('./responseSchema')

describe('mentoring/v1/permissions ', function () {
	let userDetails
	beforeAll(async () => {
		userDetails = await commonHelper.mentorLogIn()
	})
	it('/create', async () => {
		let res = await request.post('/mentoring/v1/permissions/create').send({
			code: 'edit_session',
			module: 'session_edit',
			actions: ['WRITE'],
			status: 'ACTIVE',
		})
		//console.log(res.body)
		expect(res.statusCode).toBe(201)
		expect(res.body).toMatchSchema(schema.createSchema)
	})

	it('/update', async () => {
		let res = await request.post('/mentoring/v1/permissions/update/2').send({
			code: 'sessicre',
			module: 'sessions',
			actions: ['READ'],
			status: 'ACTIVE',
		})
		//console.log(res.body)
		expect(res.statusCode).toBe(201)
		expect(res.body).toMatchSchema(schema.updateSchema)
	})

	it('/delete', async () => {
		let res = await request.post('/mentoring/v1/permissions/delete/3')
		//console.log(res.body)
		expect(res.statusCode).toBe(202)
		expect(res.body).toMatchSchema(schema.deleteSchema)
	})

	it('/list', async () => {
		let res = await request
			.get('/mentoring/v1/permissions/list')
			.query({ page: 1, limit: 10, code: 'c2Vzc2lvbg==' })
		//console.log(res.body)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(schema.listSchema)
	})
})
