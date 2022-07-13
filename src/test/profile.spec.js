const mongoose = require('mongoose')

async function loadMongo() {
	let db = await mongoose.connect(global.__MONGO_URI__ + global.mongoDBName, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	global.db = db
	return
}

describe('Share mentor profile api test', () => {
	let profile
	let userData

	beforeAll(async () => {
		await loadMongo()
		profile = require('@services/helper/profile')
		userData = require('@db/users/queries')
		return
	})

	test('Should return mentors sharable profile link', async () => {
		const expectedResult = {
			responseCode: 'OK',
			message: 'PROFILE_SHARE_LINK_GENERATED_SUCCESSFULLY',
			result: {
				shareLink: '3f5755c15ec9bb79e6a963ee423ab783',
			},
		}
		const userDataResponse = {
			email: {
				address: 'nevil@tunerlabs.com',
				verified: false,
			},
			educationQualification: null,
			_id: '62b596db57d097c92d0a6b05',
			password: '',
			name: 'nevil',
			isAMentor: true,
			hasAcceptedTAndC: false,
			deleted: false,
			updatedAt: '2022-06-24T10:50:03.999Z',
			createdAt: '2022-06-24T10:50:03.999Z',
			__v: 0,
			lastLoggedInAt: '2022-06-30T05:40:02.256Z',
		}
		const user = jest.spyOn(userData, 'findOne')
		user.mockResolvedValueOnce(userDataResponse)

		const actual = await profile.share('62b596db57d097c92d0a6b05')
		expect(actual.responseCode).toEqual(expectedResult.responseCode)
		expect(actual.result).toEqual(expectedResult.result)
	})

	test('Should not return on mentee profile', async () => {
		const userDataResponse = null
		const user = jest.spyOn(userData, 'findOne')
		user.mockResolvedValueOnce(userDataResponse)

		const actual = await profile.share('62b596db57d097c92d0a6b05')
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
