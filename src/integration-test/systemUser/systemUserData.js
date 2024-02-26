const systemUserData = require('@database/queries/users')
const utilsHelper = require('@generics/utils')
const { faker } = require('@faker-js/faker')
const crypto = require('crypto')
const baseURL = 'http://localhost:3001'
var supertest = require('supertest') //require supertest
var defaults = require('superagent-defaults')
require('@configs/aes256cbc')()

const request = defaults(supertest(baseURL)) //supertest hits the HTTP server (your app)
let defaultHeaders

let bodyData
const insertAdminUser = async () => {
	try {
		let email = 'nevil' + crypto.randomBytes(5).toString('hex') + '@admin.com'
		let password = faker.internet.password()

		bodyData = {
			name: 'Admin',
			email: email,
			password: password,
			secret_code: 'W5bF7gesuS0xsNWmpsKy',
			roles: 'admin',
			organization_id: 1,
		}
		bodyData.password = utilsHelper.hashPassword(bodyData.password)
		await systemUserData.create(bodyData)
		return { email: email, password: password }
	} catch (error) {
		console.error(error)
	}
}

const afterLogIn = async (email, password) => {
	try {
		res = await request.post('/user/v1/account/login').send({
			email: email,
			password: password,
		})
		if (res.body.result.access_token && res.body.result.user.id) {
			defaultHeaders = {
				'X-auth-token': 'bearer ' + res.body.result.access_token,
				Connection: 'keep-alive',
				'Content-Type': 'application/json',
			}
			request.set(defaultHeaders)
			return {
				token: res.body.result.access_token,
				refreshToken: res.body.result.refresh_token,
				userId: res.body.result.user.id,
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

module.exports = {
	insertAdminUser,
	afterLogIn,
}
