/**
 * name : form.spec.js
 * author : Nevil
 * created-date : 16-Oct-2022
 * Description : Integration test for form controllers.
 */

const commonHelper = require('@commonTests')
const { faker } = require('@faker-js/faker')
const questionsData = require('./questionsData')
const schema = require('./responseSchema')

describe('mentoring/v1/questions', function () {
	beforeAll(async () => {
		await commonHelper.logIn()
	})
	it('/create', async () => {
		let res = await request.post('/mentoring/v1/questions/create').send({
			question: faker.lorem.sentence(),
			options: ['1', '2'],
			deleted: false,
			responseType: 'radio',
			value: '1',
			hint: '',
		})
		//console.log(res.body)
		expect(res.statusCode).toBe(201)
		expect(res.body).toMatchSchema(schema.createSchema)
	})
	it('/read', async () => {
		let questionId = await questionsData.insertQuestion()
		let res = await request.get('/mentoring/v1/questions/read/' + questionId)

		//console.log(res.body)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(schema.readSchema)
	})
	it('/update', async () => {
		let questionId = await questionsData.insertQuestion()
		let res = await request.post('/mentoring/v1/questions/update/' + questionId).send({
			question: faker.lorem.sentence(),
			options: ['1', '2', '3'],
			deleted: false,
			responseType: 'radio',
			value: '1',
			hint: 'Answer hint',
		})
		//console.log(res.body)
		expect(res.statusCode).toBe(202)
		expect(res.body).toMatchSchema(schema.updateSchema)
	})
})
