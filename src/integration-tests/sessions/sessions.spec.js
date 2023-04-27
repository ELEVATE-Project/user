/**
 * name : entity.spec.js
 * author : Nevil
 * created-date : 14-Oct-2022
 * Description : Integration test for entity controllers.
 */

const commonHelper = require('@commonTests')
const { faker } = require('@faker-js/faker')
const sessionsData = require('./sessionsData')
const schema = require('./responseSchema')

describe('mentor flow - mentoring/v1/sessions', function () {
	beforeAll(async () => {
		await commonHelper.mentorLogIn()
	})
	it('/create', async () => {
		let res = await request.post('/mentoring/v1/sessions/update').send({
			title: faker.random.alpha(5),
			description: faker.lorem.sentence(),
			startDate: Math.floor(Date.now()) + 600,
			endDate: Math.floor(Date.now()) + 4200,
			recommendedFor: [
				{
					value: 'deo',
					label: 'District education officer',
				},
			],
			categories: [
				{
					value: 'Educational Leadership',
					label: 'Educational Leadership',
				},
			],
			medium: [
				{
					label: 'English',
					value: '1',
				},
			],
			timeZone: 'Asia/Calcutta',
			image: ['users/1232s2133sdd1.png'],
		})
		//console.log(res.body)
		expect(res.statusCode).toBe(201)
		expect(res.body).toMatchSchema(schema.createSchema)
	})
	it('/delete', async () => {
		let sessionId = await sessionsData.insertSession()
		let res = await request.delete('/mentoring/v1/sessions/update/' + sessionId)

		//console.log(res.body)
		expect(res.statusCode).toBe(202)
		expect(res.body).toMatchSchema(schema.deleteSchema)
	})
	it('/update', async () => {
		let sessionId = await sessionsData.insertSession()
		let res = await request
			.post('/mentoring/v1/sessions/update/' + sessionId)
			.send({ startDate: Math.floor(Date.now()) + 6000, endDate: Math.floor(Date.now()) + 8000 })

		//console.log(res.body)
		expect(res.statusCode).toBe(202)
		expect(res.body).toMatchSchema(schema.updateSchema)
	})
	it('/start', async () => {
		let sessionId = await sessionsData.insertSession((now = true))
		let res = await request.get('/mentoring/v1/sessions/start/' + sessionId)

		//console.log(res.body)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(schema.startSchema)
	})
	it('/list', async () => {
		await sessionsData.insertSession()
		let res = await request.get('/mentoring/v1/sessions/list')
		//console.log(res.body)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(schema.listSchema)
	})
	it('/details', async () => {
		let sessionId = await sessionsData.insertSession()
		let res = await request.get('/mentoring/v1/sessions/details/' + sessionId)
		//console.log(res.body)
		expect(res.statusCode).toBe(201)
		expect(res.body).toMatchSchema(schema.detailsSchema)
	})
	it('/share', async () => {
		let sessionId = await sessionsData.insertSession()
		let res = await request.get('/mentoring/v1/sessions/share/' + sessionId)
		//console.log(res.body)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(schema.shareSchema)
	})
	it('/updateRecordingUrl', async () => {
		await sessionsData.insertSession(false, 'published', true)
		let res = await request
			.patch('/mentoring/v1/sessions/updateRecordingUrl/c321be68f93837188a2e8a8cb679d217a24c18b7-1657692090254')
			.send({
				recordingUrl: 'www.test.com',
			})
		//console.log(res.body)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(schema.updateSchema)
	})
})

describe('mentee flow-mentoring/v1/sessions', function () {
	beforeAll(async () => {
		await commonHelper.logIn()
	})
	it('/enroll ', async () => {
		let sessionId = await sessionsData.insertSession()
		let res = await request.post('/mentoring/v1/sessions/enroll/' + sessionId)
		//console.log(res.body)
		expect(res.statusCode).toBe(201)
		expect(res.body).toMatchSchema(schema.enrollSchema)
	})
	it('/unEnroll', async () => {
		let sessionId = await sessionsData.insertSession()
		let sessionAttendeeId = await sessionsData.insertSessionAttendee(sessionId)
		let res = await request.post('/mentoring/v1/sessions/unEnroll/' + sessionId)
		//console.log(res.body)
		expect(res.statusCode).toBe(202)
		expect(res.body).toMatchSchema(schema.unenrollSchema)
	})
})
