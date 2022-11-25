/**
 * name : entity.spec.js
 * author : Nevil
 * created-date : 14-Oct-2022
 * Description : Integration test for entity controllers.
 */

const commonHelper = require('@commonTests')
const { faker } = require('@faker-js/faker')
const sessionsData = require('../sessions/sessionsData')
const schema = require('./responseSchema')

describe('mentoring/v1/feedback', function () {
	beforeAll(async () => {
		await commonHelper.logIn()
	})
	it('/create', async () => {
		let sessionId = await sessionsData.insertSession()
		await sessionsData.insertSessionAttendee(sessionId)
		let res = await request.post('/mentoring/v1/feedback/submit/' + sessionId).send({
			feedbacks: [
				{
					questionId: faker.database.mongodbObjectId(),
					value: faker.datatype.number(9),
					question: faker.lorem.sentence(),
				},
			],
			feedbackAs: 'mentor',
		})
		//console.log(res.body)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(schema.createSchema)
	})
	it('/forms', async () => {
		let sessionId = await sessionsData.insertSession()
		let res = await request.get('/mentoring/v1/feedback/forms/' + sessionId)
		//console.log(res.body)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(schema.readSchema)
	})
})
