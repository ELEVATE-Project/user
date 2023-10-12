describe('Issues api test', () => {
	const mongoose = require('mongoose')

	async function loadMongo() {
		let db = await mongoose.connect(global.__MONGO_URI__ + global.mongoDBName, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		})
		global.db = db
		return
	}

	describe('Create api test', () => {
		let issuesHelper
		let notificationTemplateData
		let issueData
		let kafkaCommunication
		const OLD_ENV = process.env

		beforeAll(async () => {
			await loadMongo()
			issuesHelper = require('@services/issues')
			notificationTemplateData = require('@db/notification-template/query')
			kafkaCommunication = require('@generics/kafka-communication')
			issueData = require('@db/issues/query')

			//jest.resetModules() //clears the cache
			process.env = { ...OLD_ENV } // Make a copy
			return
		})

		test('Should return a success response', async () => {
			process.env.ENABLE_EMAIL_FOR_REPORTED_ISSUE = true

			const expectedResult = {
				responseCode: 'OK',
				message: 'Your issue was successfully reported.',
				result: [],
			}
			const decodedToken = {
				_id: '62d00b7c082b1ebc88a2a095',
				email: 'nevil.mentor@tunerlabs.com',
				name: 'Nevil',
				isAMentor: true,
			}
			const bodyData = {
				description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
			}

			const notificationTemplateDataResponse = {
				subject: 'MentorED - A new issue has been reported.',
				body: '<div><p>Hi Team,</p>{role} {name} is facing issue in <b>{description}</b> in 2.1 version of IMentorED.</div>',
			}

			let createdIssue = await issueData.create({
				description: 'Test description',
			})

			expect(createdIssue.description).toBe('Test description')

			const kafkaResponse = { notificationtopic: { 0: 25 } }

			const templateData = jest.spyOn(notificationTemplateData, 'findOneEmailTemplate')
			templateData.mockResolvedValueOnce(notificationTemplateDataResponse)

			const kafkaData = jest.spyOn(kafkaCommunication, 'pushEmailToKafka')
			kafkaData.mockResolvedValueOnce(kafkaResponse)

			const actual = await issuesHelper.create(bodyData, decodedToken)
			expect(actual.responseCode).toEqual(expectedResult.responseCode)
			expect(actual.result).toEqual(expectedResult.result)
		})
		afterAll(async () => {
			try {
				mongoose.connection.close()
				process.env = OLD_ENV // Restore old environment
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
