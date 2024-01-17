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
		sessionService = require('@services/sessions')
		controller = require('@controllers/v1/sessions')
		sessionModel = require('@db/sessions/queries')
		userProfile = require('@requests/user')
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

	// test('should get session list', async () => {
	// 	let response = await sessionService.list('62832531a05cbd57b273aebb', 1, 10)

	// 	expect(response.statusCode).toBe(200)
	// 	expect(response.message).toBe('SESSION_FETCHED_SUCCESSFULLY')
	// })

	// test('should call session list controller', async () => {
	// 	const request = {
	// 		decodedToken: {
	// 			_id: '62832531a05cbd57b273aebb',
	// 		},
	// 		pageNo: 1,
	// 		pageSize: 10,
	// 		searchText: '',
	// 		query: {},
	// 	}

	// 	let controllerResponse = new controller()
	// 	let response = await controllerResponse.list(request)

	// 	expect(response.statusCode).toBe(200)
	// 	expect(response.message).toBe('SESSION_FETCHED_SUCCESSFULLY')
	// })

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
