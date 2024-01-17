const mongoose = require('mongoose')

async function loadMongo() {
	let db = await mongoose.connect(global.__MONGO_URI__ + global.mongoDBName, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	global.db = db
}

describe('Form controller and service file', () => {
	let formServices
	let formData
	let utils
	let KafkaProducer

	beforeAll(async () => {
		await loadMongo()
		formServices = require('@services/form')
		formData = require('@db/forms/queries')
		utils = require('@generics/utils')
		KafkaProducer = require('@generics/kafka-communication')
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
				formsVersion: [],
			},
		}
		let kafkaResponse = { internal: { 0: 77 } }
		const findOneForm = jest.spyOn(formData, 'findOneForm')
		findOneForm.mockResolvedValueOnce(null)

		const kafkaData = jest.spyOn(KafkaProducer, 'clearInternalCache')
		kafkaData.mockResolvedValueOnce(kafkaResponse)

		const actual = await formServices.create(actualInput)
		expect(actual.responseCode).toEqual(expectedResult.responseCode)
		expect(actual.result).toEqual(expectedResult.result)
	})

	test('should not add form data', async () => {
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

		const findOneFormResponse = {
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
			_id: '6329891e13fa52673aeb8c4f',
			type: 'termsAndConditions',
			subType: 'termsAndConditionsForm',
			action: 'termsAndConditionsFields',
			updatedAt: '2022-09-20T09:34:22.571Z',
			createdAt: '2022-09-20T09:34:22.571Z',
			__v: 0,
		}
		const expectedResult = {
			responseCode: 'CLIENT_ERROR',
			message: 'Form created successfully',
			result: [],
			meta: {
				formsVersion: [],
			},
		}

		const findOneForm = jest.spyOn(formData, 'findOneForm')
		findOneForm.mockResolvedValueOnce(findOneFormResponse)
		const actual = await formServices.create(actualInput)
		expect(actual.responseCode).toEqual(expectedResult.responseCode)
		expect(actual.error).toEqual(expectedResult.error)
	})

	test('should Update form data', async () => {
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
			message: 'Form updated successfully',
			result: [],
			meta: {
				formsVersion: [],
			},
		}
		let kafkaResponse = { internal: { 0: 77 } }

		const kafkaData = jest.spyOn(KafkaProducer, 'clearInternalCache')
		kafkaData.mockResolvedValueOnce(kafkaResponse)

		const actual = await formServices.update('', actualInput)
		expect(actual.responseCode).toEqual(expectedResult.responseCode)
		expect(actual.result).toEqual(expectedResult.result)
	})

	test('should Read form data', async () => {
		const formDataFromDB = {
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
			_id: '6329891e13fa52673aeb8c4f',
			type: 'termsAndConditions',
			subType: 'termsAndConditionsForm',
			action: 'termsAndConditionsFields',
			updatedAt: '2022-09-20T09:34:22.571Z',
			createdAt: '2022-09-20T09:34:22.571Z',
			__v: 1,
		}

		const expectedResult = {
			responseCode: 'OK',
			message: 'Form fetched successfully',
			result: {
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
				_id: '6329891e13fa52673aeb8c4f',
				type: 'termsAndConditions',
				subType: 'termsAndConditionsForm',
				action: 'termsAndConditionsFields',
				updatedAt: '2022-09-20T09:34:22.571Z',
				createdAt: '2022-09-20T09:34:22.571Z',
				__v: 1,
			},
			meta: {
				formsVersion: [],
			},
		}

		const mockFormData = jest.spyOn(formData, 'findOneForm')
		mockFormData.mockResolvedValueOnce(formDataFromDB)

		const actual = await formServices.read('6329891e13fa52673aeb8c4f')

		expect(actual.responseCode).toEqual(expectedResult.responseCode)
		expect(actual.result).toEqual(expectedResult.result)
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
