/**
 * name : form.spec.js
 * author : Nevil
 * created-date : 16-Oct-2022
 * Description : Integration test for form controllers.
 */

const commonHelper = require('@commonTests')
const { faker } = require('@faker-js/faker')
const questionsData = require('../questions/questionsData')
const questionsSetData = require('./question-setData')
const schema = require('./responseSchema')

describe('mentoring/v1/question-set', function () {
	beforeAll(async () => {
		await commonHelper.logIn()
	})
	it('/create', async () => {
		let questionId = await questionsData.insertQuestion()
		let res = await request.post('/mentoring/v1/question-set/create').send({
			questions: [questionId],
			code: faker.random.alpha(5),
		})
		//console.log(res.body)
		expect(res.statusCode).toBe(201)
		expect(res.body).toMatchSchema(schema.createSchema)
	})
	it('/read', async () => {
		let questionSetId = await questionsSetData.insertQuestionSet()
		let res = await request.get('/mentoring/v1/question-set/read/' + questionSetId)

		//console.log(res.body)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(schema.readSchema)
	})
	it('/update', async () => {
		let questionId = await questionsData.insertQuestion()
		let questionSetId = await questionsSetData.insertQuestionSet()
		let res = await request.post('/mentoring/v1/question-set/update/' + questionSetId).send({
			questions: [questionId],
		})
		//console.log(res.body)
		expect(res.statusCode).toBe(202)
		expect(res.body).toMatchSchema(schema.updateSchema)
	})
})
