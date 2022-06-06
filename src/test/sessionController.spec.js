const chai = require('chai')
const sinon = require('sinon')
const expect = chai.expect
const flushPromises = () => new Promise(setImmediate)

global.db = {
	model: function () {
		return
	},
}
const sessionService = require('@services/helper/sessions')
let controller = require('@controllers/v1/sessions')

describe('session service', async function () {
	afterEach(() => {
		sinon.restore()
	})

	it('should get session details', async () => {
		const request = {
			params: {
				id: '62832531a05cbd57b273aebb',
			},
			decodedToken: {
				_id: '62832531a05cbd57b273aebb',
			},
		}
		const response = {
			status: 'upcoming',
			title: 'my data',
			description: 'Training in leadership and skills improvement',
			startDateTime: '2021-10-08 12:00:13',
			endDateTime: '2021-10-08 12:30:13',
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
		}

		sinon.stub(sessionService, 'details').returns(response)

		let controllerResponse = new controller()
		let details = await controllerResponse.details(request)
		// await flushPromises();
		expect(details).to.equals(response)
	})
})
