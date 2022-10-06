/**
 * name : profile.spec.js
 * author : Nevil
 * created-date : 28-Sep-2022
 * Description : Integration test for profile controllers.
 */

const { request, logIn, logError } = require('@commonTests')
const { profileDetailsSchema, profileUpdateSchema, profileShareSchema } = require('./responseSchema')
const { insertMentor } = require('./profileData')

describe('End point test for profile', function () {
	let userDetails

	beforeAll(async () => {
		userDetails = await logIn()
	})
	it('details', async () => {
		let res = await request.get('/user/v1/profile/details/').query({ userId: userDetails.userId })

		logError(res)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(profileDetailsSchema)
	})
	it('update', async () => {
		let res = await request.patch('/user/v1/profile/update').send({
			name: 'Nevil M',
			designation: [
				{
					value: '1',
					label: 'Teacher',
				},
				{
					value: '2',
					label: 'District Official',
				},
			],
			location: [
				{
					value: '1',
					label: 'Bangalore',
				},
			],
			about: 'This is test about of mentee',
			areasOfExpertise: [
				{
					value: '1',
					label: 'Educational Leadership',
				},
				{
					value: '2',
					label: 'SQAA',
				},
			],
			experience: 4.2,
			hasAcceptedTAndC: true,
			gender: 'MALE',
			educationQualification: 'B.A.',
			image: 'https://cloudstorage.com/container/abc.png',
		})

		logError(res)
		expect(res.statusCode).toBe(202)
		expect(res.body).toMatchSchema(profileUpdateSchema)
	})
	it('/share', async () => {
		let userId = await insertMentor()
		let res = await request.get('/user/v1/profile/share/' + userId)

		logError(res)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(profileShareSchema)
	})
})
