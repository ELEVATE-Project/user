var supertest = require('supertest') //require supertest
var defaults = require('superagent-defaults')
const { faker } = require('@faker-js/faker')
const crypto = require('crypto')
let baseURL = 'http://localhost:3000'
//supertest hits the HTTP server (your app)
let defaultHeaders
const logIn = async () => {
	try {
		let request = defaults(supertest('http://localhost:3001'))
		let waitOn = require('wait-on')
		let opts = {
			resources: [baseURL],
			delay: 1000, // initial delay in ms, default 0
			interval: 500, // poll interval in ms, default 250ms
			timeout: 30000,
		}
		await waitOn(opts)
		let email = 'nevil' + crypto.randomBytes(5).toString('hex') + '@tunerlabs.com'
		let password = faker.internet.password()
		let res = await request.post('/user/v1/account/create').send({
			name: 'Nevil',
			email: email,
			password: password,
			isAMentor: false,
		})
		res = await request.post('/user/v1/account/login').send({
			email: email,
			password: password,
		})
		//console.log(res.body)

		if (res.body.result.access_token && res.body.result.user._id) {
			defaultHeaders = {
				'X-auth-token': 'bearer ' + res.body.result.access_token,
				Connection: 'keep-alive',
				'Content-Type': 'application/json',
			}
			global.request = defaults(supertest(baseURL))
			global.request.set(defaultHeaders)
			global.userId = res.body.result.user._id
			/* .end(function (err, res) {
				let successCodes = [200, 201, 202]
				if (!successCodes.includes(res.statusCode)) {
					console.log('Response Body', res.body)
				}
			}) */

			return {
				token: res.body.result.access_token,
				refreshToken: res.body.result.refresh_token,
				userId: res.body.result.user._id,
				email: email,
				password: password,
			}
		} else {
			console.error('Error while getting access token')
			return false
		}
	} catch (error) {
		console.error(error)
	}
}
const mentorLogIn = async () => {
	try {
		let request = defaults(supertest('http://localhost:3001'))
		var waitOn = require('wait-on')
		var opts = {
			resources: [baseURL],
			delay: 1000, // initial delay in ms, default 0
			interval: 500, // poll interval in ms, default 250ms
			timeout: 30000,
		}
		await waitOn(opts)
		let email = 'nevil' + crypto.randomBytes(5).toString('hex') + '@tunerlabs.com'
		let password = faker.internet.password()
		let res = await request.post('/user/v1/account/create').send({
			name: 'Nevil',
			email: email,
			password: password,
			isAMentor: true,
			secretCode: 'secret-code',
		})
		res = await request.post('/user/v1/account/login').send({
			email: email,
			password: password,
		})

		if (res.body.result.access_token && res.body.result.user._id) {
			defaultHeaders = {
				'X-auth-token': 'bearer ' + res.body.result.access_token,
				Connection: 'keep-alive',
				'Content-Type': 'application/json',
			}
			global.request = defaults(supertest(baseURL))
			global.request.set(defaultHeaders) /* .end(function (err, res) {
				let successCodes = [200, 201, 202]
				if (!successCodes.includes(res.statusCode)) {
					console.log('Response Body', res.body)
				}
			}) */
			global.userId = res.body.result.user._id
			return {
				token: res.body.result.access_token,
				refreshToken: res.body.result.refresh_token,
				userId: res.body.result.user._id,
				email: email,
				password: password,
			}
		} else {
			console.error('Error while getting access token')
			return false
		}
	} catch (error) {
		console.error(error)
	}
}
function logError(res) {
	let successCodes = [200, 201, 202]
	if (!successCodes.includes(res.statusCode)) {
		console.log('Response Body', res.body)
	}
}
module.exports = {
	logIn, //-- export if token is generated
	logError,
	mentorLogIn,
}
