/**
 * name : entity.spec.js
 * author : Nevil
 * created-date : 14-Oct-2022
 * Description : Integration test for entity controllers.
 */

//const { faker } = require('@faker-js/faker')
//const entityData = require('./emailData')
const schema = require('./responseSchema')
const commonHelper = require('../commonTests')

describe('/notification/v1/email', function () {
	beforeAll(async () => {
		await commonHelper.logIn()
	})
	it('/send', async () => {
		let res = await request.post('/notification/v1/email/send').send({
			type: 'email',
			email: {
				to: 'nevil@gmail.com',
				subject: 'Test Email',
				body: 'Sample email body',
				replyTo: 'nevil@test.com',
			},
		})
		//console.log(res.body)
		expect(res.statusCode).toBe(400)
		expect(res.body).toMatchSchema(schema.sendEmailFailedSchema)
	})
})
