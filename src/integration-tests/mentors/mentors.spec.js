/**
 * name : entity.spec.js
 * author : Nevil
 * created-date : 14-Oct-2022
 * Description : Integration test for entity controllers.
 */

const commonHelper = require('@commonTests')
const schema = require('./responseSchema')

describe('mentoring/v1/mentors ', function () {
	let userDetails
	beforeAll(async () => {
		userDetails = await commonHelper.mentorLogIn()
	})
	it('/reports', async () => {
		let res = await request.get('/mentoring/v1/mentors/reports').query({ filterType: 'QUARTERLY' })
		//console.log(res.body)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(schema.reportsSchema)
	})
	it('/profile', async () => {
		let res = await request.get('/mentoring/v1/mentors/profile/' + userDetails.userId)
		//console.log(res.body)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(schema.profileSchema)
	})
	it('/upcomingSessions', async () => {
		let res = await request.get('/mentoring/v1/mentors/upcomingSessions/' + userDetails.userId)
		//console.log(res.body)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(schema.upcomingSessionsSchema)
	})
	it('/share', async () => {
		let res = await request.get('/mentoring/v1/mentors/share/' + userDetails.userId)
		//console.log(res.body)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(schema.shareSchema)
	})
})
