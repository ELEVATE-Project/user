const mongoose = require('mongoose')

async function loadMongo() {
	let db = await mongoose.connect(global.__MONGO_URI__ + global.mongoDBName, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	global.db = db
	return
}

describe('Sessions controller and helper test', () => {
	let mentorsServices
	let sessionAttended
	let sessionsData
	let userProfile

	const mockQueries = () => ({
		findAllSessionAttendees: jest.fn(),
		details: jest.fn(),
		findSessionHosted: jest.fn(),
	})

	beforeAll(async () => {
		await loadMongo()
		mentorsServices = require('@services/helper/mentors')
		sessionAttended = require('@db/sessionAttendees/queries')
		sessionsData = require('@db/sessions/queries')
		userProfile = require('@services/helper/userProfile')
		return
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
			meta: {},
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

		const mockUserDetails = jest.spyOn(userProfile, 'details')
		mockUserDetails.mockResolvedValueOnce(userProfileApiResponse)

		const mockMentorSessionAttended = jest.spyOn(sessionAttended, 'findAllSessionAttendees')
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
