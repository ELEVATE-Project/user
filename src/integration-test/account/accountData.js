const usersData = require('@database/queries/users')
const { faker } = require('@faker-js/faker')
const utilsHelper = require('@generics/utils')
const crypto = require('crypto')
let bodyData

const insertUser = async () => {
	try {
		let email = 'nevil' + crypto.randomBytes(5).toString('hex') + '@tunerlabs.com'
		let password = faker.internet.password()
		bodyData = {
			name: 'Nevil',
			email: { address: email, verified: false },
			password: password,
			isAMentor: false,
		}
		bodyData.password = utilsHelper.hashPassword(bodyData.password)
		await usersData.createUser(bodyData)
		return {
			email: email,
			password: password,
		}
	} catch (error) {
		console.error(error)
	}
}

module.exports = {
	insertUser,
}
