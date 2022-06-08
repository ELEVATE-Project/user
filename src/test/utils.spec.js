const chai = require('chai')
const expect = chai.expect

const utils = require('@generics/utils')

describe('Utils ', function () {
	it('should check composeEmailBody', async function () {
		let emailBody = 'Hi {name}, welcome to elevate'
		const emaiCompose = utils.composeEmailBody(emailBody, { name: 'user' })
		expect(emaiCompose).to.equal('Hi user, welcome to elevate')
	})
})
