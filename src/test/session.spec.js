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
	let controller
	let sessionService
	let sessionModel
	let userProfile
	beforeAll(async () => {
		await loadMongo()
		sessionService = require('@services/helper/sessions')
		controller = require('@controllers/v1/sessions')
		sessionModel = require('@db/sessions/queries')
		userProfile = require('@services/helper/userProfile')
		return
	})

	test('should create session', async () => {
		let createdSession = await sessionModel.createSession({
			title: 'testing',
			description: 'Training in leadership',
			startDate: '2022-01-04 18:00:00',
			endDate: '2022-01-04 18:30:00',
			userId: '62832531a05cbd57b273aebb',
			recommendedFor: [
				{
					label: 'HM',
					value: 1,
				},
			],
			categories: [
				{
					label: 'label',
					value: 'value',
				},
			],
			medium: [
				{
					label: 'Hindi',
					value: 2,
				},
			],
		})

		expect(createdSession.title).toBe('testing')
		expect(createdSession.description).toBe('Training in leadership')
	})

	test('should get session list', async () => {
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
		const mockUserDetails = jest.spyOn(userProfile, 'details')
		mockUserDetails.mockResolvedValueOnce(userProfileApiResponse)

		let response = await sessionService.list('62832531a05cbd57b273aebb', 1, 10)

		expect(response.statusCode).toBe(200)
		expect(response.message).toBe('SESSION_FETCHED_SUCCESSFULLY')
	})

	test('should call session list controller', async () => {
		const request = {
			decodedToken: {
				_id: '62832531a05cbd57b273aebb',
			},
			pageNo: 1,
			pageSize: 10,
			searchText: '',
			query: {},
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
		const mockUserDetails = jest.spyOn(userProfile, 'details')
		mockUserDetails.mockResolvedValueOnce(userProfileApiResponse)

		let controllerResponse = new controller()
		let response = await controllerResponse.list(request)

		expect(response.statusCode).toBe(200)
		expect(response.message).toBe('SESSION_FETCHED_SUCCESSFULLY')
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
