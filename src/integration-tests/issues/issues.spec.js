/**
 * name : form.spec.js
 * author : Nevil
 * created-date : 16-Oct-2022
 * Description : Integration test for form controllers.
 */

const commonHelper = require('@commonTests')
const { faker } = require('@faker-js/faker')
const schema = require('./responseSchema')

describe('mentoring/v1/issues', function () {
	beforeAll(async () => {
		await commonHelper.logIn()
	})
	it('/create', async () => {
		let res = await request.post('/mentoring/v1/issues/create').send({
			description: faker.lorem.sentence(),
		})
		//console.log(res.body)
		expect(res.statusCode).toBe(201)
		expect(res.body).toMatchSchema(schema.createSchema)
	})
})
