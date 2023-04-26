/**
 * name : entity.spec.js
 * author : Nevil
 * created-date : 14-Oct-2022
 * Description : Integration test for entity controllers.
 */

const commonHelper = require('@commonTests')
const sessionsData = require('../sessions/sessionsData')
const schema = require('./responseSchema')

describe('mentoring/v1/mentees', function () {
	beforeAll(async () => {
		await commonHelper.logIn()
	})
	it('/joinSession', async () => {
		let sessionId = await sessionsData.insertSession((now = true), (sessionStatus = 'live'), (meetingInfo = true))
		await sessionsData.insertSessionAttendee(sessionId)
		let res = await request.post('/mentoring/v1/mentees/joinSession/' + sessionId)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(schema.joinSessionSchema)
	})
	it('/homeFeed', async () => {
		let res = await request.get('/mentoring/v1/mentees/homeFeed')
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(schema.homeFeedSchema)
	})
	it('/reports', async () => {
		let res = await request.get('/mentoring/v1/mentees/reports').query({ filterType: 'QUARTERLY' })
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(schema.reportsSchema)
	})
	it('/profile', async () => {
		let res = await request.get('/mentoring/v1/mentees/profile')
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(schema.profileSchema)
	})
	it('/sessions', async () => {
		let res = await request.get('/mentoring/v1/mentees/sessions').query({ enrolled: 'false' })
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(schema.sessionsSchema)
	})
})
