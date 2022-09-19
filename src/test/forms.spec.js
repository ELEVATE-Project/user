describe('Sessions controller and helper test', () => {
	beforeAll(async () => {
		// let formServices = require('@services/helper/form')
		return
	})

	test('should add form data', async () => {
		const actualInput = {
			data: {
				templateName: 'defaultTemplate',
				fields: {
					controls: [
						{
							name: 'termsAndConditions',
							label: "<div class='wrapper'><p>The Terms and Conditions constitute a legally binding agreement made between you and Shikshalokam, concerning your access to and use of our mobile application MentorED.</p><p>By creating an account, you have read, understood, and agree to the <br /> <a class='links' href='https://shikshalokam.org/mentoring/term-of-use'>Terms of Use</a> and <a class='links' href='https://shikshalokam.org/mentoring/privacy-policy'>Privacy Policy.</p></div>",
							value: "I've read and agree to the User Agreement <br /> and Privacy Policy",
							class: 'ion-margin',
							type: 'html',
							position: 'floating',
							validators: {
								required: true,
								minLength: 10,
							},
						},
					],
				},
			},
			type: 'termsAndConditions',
			subType: 'termsAndConditionsForm',
			action: 'termsAndConditionsFields',
		}
		const expectedResult = {
			responseCode: 'OK',
			message: 'Form created successfully',
			result: [],
			meta: {
				formsVersion: {},
			},
		}
		// const findOneForm = jest.spyOn(FormData, 'findOneForm')
		// findOneForm.mockResolvedValueOnce(null)
		// const actual = await formServices.create(actualInput)
		// expect(actual).toEqual(expectedResult)
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
