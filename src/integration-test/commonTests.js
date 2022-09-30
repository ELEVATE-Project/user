const baseURL = 'http://localhost:3001'
var supertest = require('supertest') //require supertest
var defaults = require('superagent-defaults')

const request = defaults(supertest(baseURL)) //supertest hits the HTTP server (your app)
let defaultHeaders
const logIn = async () => {
	try {
		var waitOn = require('wait-on')
		var opts = {
			resources: [baseURL],
			delay: 1000, // initial delay in ms, default 0
			interval: 500, // poll interval in ms, default 250ms
			timeout: 30000,
		}
		await waitOn(opts)
		let email = 'nevil.' + Math.random() + '@tunerlabs.com'

		let res = await request.post('/user/v1/account/create').send({
			name: 'Nevil',
			email: email,
			password: 'testing',
			isAMentor: false,
		})
		res = await request.post('/user/v1/account/login').send({
			email: email,
			password: 'testing',
		})
		//console.log(res.body)

		if (res.body.result.access_token && res.body.result.user._id) {
			defaultHeaders = {
				'X-auth-token': 'bearer ' + res.body.result.access_token,
				Connection: 'keep-alive',
				'Content-Type': 'application/json',
			}
			request.set(defaultHeaders)

			return {
				token: res.body.result.access_token,
				refreshToken: res.body.result.refresh_token,
				userId: res.body.result.user._id,
				email: email,
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
	request,
	logIn, //-- export if token is generated
	logError,
}
