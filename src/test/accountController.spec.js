const chai = require('chai')
const sinon = require('sinon')
const expect = chai.expect
const flushPromises = () => new Promise(setImmediate)

global.db = {
	model: function () {
		return
	},
}
const accountService = require('../services/helper/account')
let controller = require('../controllers/v1/account')

let mockData = require('./mock')

describe('Account service', async function () {
	afterEach(() => {
		sinon.restore()
	})

	it('login api check', async () => {
		const request = {
			email: 'example@mail.com',
			password: 'Password',
		}

		sinon.stub(accountService, 'login').returns(mockData.loginResponse)

		let controllerResponse = new controller()
		let loginResponse = await controllerResponse.login(request)
		// await flushPromises();
		expect(loginResponse).to.equals(mockData.loginResponse)
	})
})
