const usersData = require('@db/users/queries')
const utilsHelper = require('@generics/utils')
const { faker } = require('@faker-js/faker')
const crypto = require('crypto')

let bodyData

const insertMentor = async () => {
	try {
		let email = 'nevil' + crypto.randomBytes(5).toString('hex') + '@tunerlabs.com'
		let password = faker.internet.password()

		bodyData = {
			name: 'Nevil',
			email: { address: email, verified: false },
			password: password,
			isAMentor: true,
		}
		bodyData.password = utilsHelper.hashPassword(bodyData.password)
		await usersData.createUser(bodyData)
		let user = await usersData.findOne({ 'email.address': email }, {})
		return user._id.valueOf()
	} catch (error) {
		console.error(error)
	}
}

module.exports = {
	insertMentor,
}
