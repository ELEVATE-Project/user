const usersData = require('@database/queries/users')
const { faker } = require('@faker-js/faker')
const utilsHelper = require('@generics/utils')
const crypto = require('crypto')
const { constant } = require('lodash')
let bodyData

const insertUser = async () => {
	try {
		let email = 'suman' + crypto.randomBytes(5).toString('hex') + '@pacewi.com'
		let password = faker.internet.password()
		bodyData = {
			name: 'Suman',
			email: { address: email, verified: false },
			password: password,
			isAMentor: false,
		}
		bodyData.password = utilsHelper.hashPassword(bodyData.password)
		await usersData.create(bodyData)
		console.log('insertuser')
		return {
			email: email,
			password: password,
		}
	} catch (error) {
		console.error(error)
	}
}

const returnotp = async () => {
	try {
		let email = 'suman.v0aecea4ac0@pacewi.com'
		let useremail = email.toLowerCase()
		bodyData = {
			email: { address: useremail, verified: false },
		}
		await usersData
		return {
			email: useremail,
			otp: redisotp,
		}
	} catch (error) {
		console.error(error)
	}
}

module.exports = {
	insertUser,
	returnotp,
}
