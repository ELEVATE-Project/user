const commonHelper = require('@commonTests')
const schema = require('./responseSchema')

describe('mentoring/v1/role-permission-mapping', function () {
	let userDetails
	beforeAll(async () => {
		userDetails = await commonHelper.mentorLogIn()
	})
	it('/create', async () => {
		let res = await request.post('/mentoring/v1/role-permission-mapping/create/5').send({
			permission_id: 1,
		})
		//console.log(res.body)
		expect(res.statusCode).toBe(201)
		expect(res.body).toMatchSchema(schema.createSchema)
	})

	it('/delete', async () => {
		let res = await request.post('/mentoring/v1/role-permission-mapping/delete/5').send({
			permission_id: 1,
		})
		//console.log(res.body)
		expect(res.statusCode).toBe(201)
		expect(res.body).toMatchSchema(schema.deleteSchema)
	})
})
