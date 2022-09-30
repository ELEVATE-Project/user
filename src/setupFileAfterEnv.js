const mongoose = require('mongoose')
const mongoose_autopopulate = require('mongoose-autopopulate')
const mongoose_timestamp = require('mongoose-timestamp')
const { matchers } = require('jest-json-schema')
expect.extend(matchers)

//Connect to database

const db = mongoose.createConnection('mongodb://127.0.0.1:27017/elevate-mentoring', {
	useNewUrlParser: true,
})

/* const db = mongoose.createConnection(process.env.MONGODB_URL, {
	useNewUrlParser: true,
}) */

db.on('error', function () {
	console.log('Database connection error:')
})

db.once('open', function () {
	//console.log('Connected to DB')
})

mongoose.plugin(mongoose_timestamp, {
	createdAt: 'createdAt',
	updatedAt: 'updatedAt',
})

mongoose.plugin(mongoose_autopopulate)

global.db = db

beforeAll(async () => {
	/* 	try {
		let baseURL = 'http://localhost:' + process.env.APPLICATION_PORT
		var waitOn = require('wait-on')
		var opts = {
			resources: [baseURL],
			delay: 1000, // initial delay in ms, default 0
			interval: 500, // poll interval in ms, default 250ms
			timeout: 30000,
			//log: true,
		}
		await waitOn(opts)
		var supertest = require('supertest') //require supertest

		const request = supertest(baseURL) //supertest hits the HTTP server (your app)

		const getUserDetails = async () => {
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
			if (res.body?.result?.access_token && res.body?.result?.user?._id) {
				return {
					token: res.body.result.access_token,
					userId: res.body.result.user._id,
				}
			} else {
				return false
			}
		}
		global.userDetails = await getUserDetails()
		global.request = request
		// once here, all resources are available
	} catch (error) {
		console.log(error)
	} */
})

afterAll(async () => {
	try {
		//console.log('runs afterAll')
		//await db.dropDatabase()
	} catch (error) {
		console.log(error)
	}
	mongoose.disconnect()
})
