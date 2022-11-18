var supertest = require('supertest') //require supertest
var defaults = require('superagent-defaults')
let baseURL = 'http://localhost:3002'
//supertest hits the HTTP server (your app)
let defaultHeaders
const logIn = async () => {
	try {
		let waitOn = require('wait-on')
		let opts = {
			resources: [baseURL],
			delay: 1000, // initial delay in ms, default 0
			interval: 500, // poll interval in ms, default 250ms
			timeout: 30000,
		}
		//await waitOn(opts)
		defaultHeaders = {
			internal_access_token: process.env.INTERNAL_ACCESS_TOKEN,
			Connection: 'keep-alive',
			'Content-Type': 'application/json',
		}
		global.request = defaults(supertest(baseURL))
		global.request.set(defaultHeaders)
	} catch (error) {
		console.error(error)
	}
}
module.exports = {
	logIn,
}
