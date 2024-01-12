/**
 * name : entity.spec.js
 * author : Nevil
 * created-date : 14-Oct-2022
 * Description : Integration test for entity controllers.
 */

const commonHelper = require('@commonTests')
const schema = require('./responseSchema')
let loginInfo
describe('mentoring/v1/mentees', function () {
	beforeAll(async () => {
		loginInfo = await commonHelper.logIn()
		await request.post('/mentoring/v1/profile/create').send({
			designation: ['beo', 'deo', 'testt'],
			area_of_expertise: ['educational_leadership', 'sqaa'],
			education_qualification: 'MBA',
			tags: ['Experienced', 'Technical'],
			visibility: 'visible',
			organisation_ids: [1],
			external_session_visibility: 'CURRENT',
			external_mentor_visibility: 'ALL',
		})
	}, 100000)

	it('/list - with email', async () => {
		let res = await request.post('/mentoring/v1/mentees/list' + '?page=1&limit=100&email=' + loginInfo.email)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(schema.menteeListSchema)
	})

	it('/list - with name', async () => {
		let res = await request.post('/mentoring/v1/mentees/list' + '?page=1&limit=100&name=' + loginInfo.firstname)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(schema.menteeListSchema)
	})
})
