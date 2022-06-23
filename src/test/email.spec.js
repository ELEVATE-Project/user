describe('Email Controller test', () => {
	let controller
	let emailService
	beforeAll(async () => {
		emailService = require('@services/helper/email')
		controller = require('@controllers/v1/email')
		return
	})

	test('should call email send controller', async () => {
		const request = {
			body: {
				type: 'email',
				email: {
					to: 'ankitstar00786@gmail.com',
					subject: 'temp',
					body: 'data',
				},
			},
		}

		let controllerResponse = new controller()
		let response = await controllerResponse.send(request)

		expect(response.statusCode).toBe(400)
		expect(response.message).toBe('CLIENT_ERROR')
		// expect(response.statusCode).toBe(200)
		// expect(response.message).toBe('Email sent successfully.')
	})

	afterAll(async () => {
		try {
		} catch (error) {
			console.log(`
            You did something wrong
            ${error}
          `)
			throw error
		}
	})
})
