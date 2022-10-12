/**
 * name : mentor.spec.js
 * author : Nevil
 * created-date : 28-Sep-2022
 * Description : Integration test for mentor controllers.
 */

const { request, logIn, logError } = require('@commonTests')
const { listMentorsSchema } = require('./responseSchema')
const { insertMentor } = require('./mentorData')

describe('user/v1/mentors', function () {
	let userDetails

	beforeAll(async () => {
		userDetails = await logIn()
	})
	it('/list', async () => {
		await insertMentor()
		let res = await request.get('/user/v1/mentors/list')
		logError(res)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(listMentorsSchema)
	})
})
