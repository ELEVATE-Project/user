/**
 * name : mentor.spec.js
 * author : Nevil
 * created-date : 28-Sep-2022
 * Description : Integration test for mentor controllers.
 */

const { request, logIn, mentorLogIn, logError } = require('@commonTests')
const { listMentorsSchema } = require('./responseSchema')
const { insertMentor } = require('./mentorData')

describe('user/v1/mentors', function () {
	let userDetails

	beforeAll(async () => {
		userDetails = await mentorLogIn()
	})
	it('/list', async () => {
		//	await insertMentor()
		let res = await request.post('/user/v1/mentors/list').set({
			'X-auth-token': 'bearer ' + userDetails.token,
			Connection: 'keep-alive',
			'Content-Type': 'application/json',
		})
		logError(res)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(listMentorsSchema)
	})
})

// mentor/list role permissions are not present , so integrations doesn't work.
