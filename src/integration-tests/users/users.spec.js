/**
 * name : entity.spec.js
 * author : Nevil
 * created-date : 14-Oct-2022
 * Description : Integration test for entity controllers.
 */

const commonHelper = require('@commonTests')
const schema = require('./responseSchema')

describe('mentoring/v1/users', function () {
	beforeAll(async () => {
		await commonHelper.logIn()
	})
	it('/list', async () => {
		let res = await request.get('/mentoring/v1/users/list').query({ type: 'mentee' })
		//console.log(res.body.result.data)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(schema.listSchema)
	})
	it('/pendingFeedbacks', async () => {
		let res = await request.get('/mentoring/v1/users/pendingFeedbacks')
		//console.log(res.body)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(schema.pendingFeedBacksSchema)
	})
})
