const mongoose = require('mongoose')

async function loadMongo() {
	let db = await mongoose.connect(global.__MONGO_URI__ + global.mongoDBName, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	global.db = db
}

describe('Sessions controller and helper test', () => {
	let mentorsServices
	let sessionAttended
	let sessionsData
	let userProfile
	let { RedisHelper } = require('elevate-node-cache')

	beforeAll(async () => {
		await loadMongo()
		mentorsServices = require('@services/helper/mentors')
		sessionAttended = require('@db/sessionAttendees/queries')
		sessionsData = require('@db/sessions/queries')
		userProfile = require('@services/helper/userProfile')
	})

	test('should return Profile of mentor', async () => {
		const expectedResult = {
			statusCode: 200,
			responseCode: 'OK',
			message: 'PROFILE_FTECHED_SUCCESSFULLY',
			result: {
				sessionsAttended: 2,
				sessionsHosted: 2,
				email: {
					address: 'ankit.s@pacewisdomss.com',
					verified: false,
				},
				_id: '62a820225ff93f30cfe5f990',
				name: 'Ankit',
				isAMentor: true,
				hasAcceptedTAndC: true,
				educationQualification: 'B.A.',
				deleted: false,
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
				languages: [],
				updatedAt: '2022-06-14T06:18:23.423Z',
				createdAt: '2022-06-14T05:44:02.911Z',
				__v: 0,
				lastLoggedInAt: '2022-07-07T01:43:53.097Z',
				about: 'This is test about of mentee',
				experience: '4.2',
				gender: 'MALE',
				image: 'https://aws-bucket-storage-name.s3.ap-south-1.amazonaws.com/https://cloudstorage.com/container/abc.png',
			},
			meta: {
				formsVersion: {},
			},
		}

		const userProfileApiResponse = {
			success: true,
			data: {
				responseCode: 'OK',
				message: 'Profile fetched successfully.',
				result: {
					email: {
						address: 'ankit.s@pacewisdomss.com',
						verified: false,
					},
					_id: '62a820225ff93f30cfe5f990',
					name: 'Ankit',
					isAMentor: true,
					hasAcceptedTAndC: true,
					educationQualification: 'B.A.',
					deleted: false,
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
					languages: [],
					updatedAt: '2022-06-14T06:18:23.423Z',
					createdAt: '2022-06-14T05:44:02.911Z',
					__v: 0,
					lastLoggedInAt: '2022-07-07T01:43:53.097Z',
					about: 'This is test about of mentee',
					experience: '4.2',
					gender: 'MALE',
					image: 'https://aws-bucket-storage-name.s3.ap-south-1.amazonaws.com/https://cloudstorage.com/container/abc.png',
				},
			},
		}

		const mockRedisClientGetKey = jest.spyOn(RedisHelper, 'getKey')
		mockRedisClientGetKey.mockResolvedValueOnce(false)

		const mockRedisClientSetKey = jest.spyOn(RedisHelper, 'setKey')
		mockRedisClientSetKey.mockResolvedValueOnce(true)
		const mockUserDetails = jest.spyOn(userProfile, 'details')
		mockUserDetails.mockResolvedValueOnce(userProfileApiResponse)

		const mockMentorSessionAttended = jest.spyOn(sessionAttended, 'countAllSessionAttendees')
		mockMentorSessionAttended.mockResolvedValueOnce(2)

		const mockMentorsSessionHosted = jest.spyOn(sessionsData, 'findSessionHosted')
		mockMentorsSessionHosted.mockResolvedValueOnce(2)

		const actual = await mentorsServices.profile('62a820225ff93f30cfe5f990')
		expect(actual).toEqual(expectedResult)
	})
	test('should throw error on mentee profile', async () => {
		const userProfileApiResponse = {
			success: true,
			data: {
				responseCode: 'OK',
				message: 'Profile fetched successfully.',
				result: {
					email: {
						address: 'ankit.s@pacewisdomss.com',
						verified: false,
					},
					_id: '62a820225ff93f30cfe5f990',
					name: 'Ankit',
					isAMentor: false,
					hasAcceptedTAndC: true,
					educationQualification: 'B.A.',
					deleted: false,
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
					languages: [],
					updatedAt: '2022-06-14T06:18:23.423Z',
					createdAt: '2022-06-14T05:44:02.911Z',
					__v: 0,
					lastLoggedInAt: '2022-07-07T01:43:53.097Z',
					about: 'This is test about of mentee',
					experience: '4.2',
					gender: 'MALE',
					image: 'https://aws-bucket-storage-name.s3.ap-south-1.amazonaws.com/https://cloudstorage.com/container/abc.png',
				},
			},
		}

		const mockRedisClient = jest.spyOn(RedisHelper, 'getKey')
		mockRedisClient.mockResolvedValueOnce(false)
		const mockRedisClientSetKey = jest.spyOn(RedisHelper, 'setKey')
		mockRedisClientSetKey.mockResolvedValueOnce(true)
		const mockUserDetails = jest.spyOn(userProfile, 'details')
		mockUserDetails.mockResolvedValueOnce(userProfileApiResponse)

		const actual = await mentorsServices.profile('62a820225ff93f30cfe5f990')

		expect(actual.statusCode).toEqual(400)
		expect(actual.responseCode).toEqual('CLIENT_ERROR')
	})

	afterAll(async () => {
		try {
			mongoose.connection.close()
		} catch (error) {
			console.log(`
            You did something wrong
            ${error}
          `)
			throw error
		}
	})
})
