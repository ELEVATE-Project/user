describe('User profile api test', () => {
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
		let request

		beforeAll(async () => {
			await loadMongo()
			profile = require('@requests/user')
			request = require('@generics/requests')
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
			const shareApiResponse = {
				success: true,
				data: {
					responseCode: 'OK',
					message: 'Profile share link generated successfully',
					result: {
						shareLink: '3f5755c15ec9bb79e6a963ee423ab783',
					},
				},
			}
			const user = jest.spyOn(request, 'get')
			user.mockResolvedValueOnce(shareApiResponse)

			const actual = await profile.share('62b596db57d097c92d0a6b05')
			expect(actual.responseCode).toEqual(expectedResult.responseCode)
			expect(actual.result).toEqual(expectedResult.result)
		})

		test('Should not return on mentee profile', async () => {
			const expectedResult = {
				message: "User doesn't exist.",
			}

			const shareAPIResponse = {
				success: true,
				data: {
					responseCode: 'CLIENT_ERROR',
					message: "User doesn't exist.",
					error: [],
				},
			}
			const shareResponse = jest.spyOn(request, 'get')
			shareResponse.mockResolvedValueOnce(shareAPIResponse)

			const actual = await profile.share('62b596db57d097c92d0a6b05')
			expect(actual.message).toEqual(expectedResult.message)
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
})
