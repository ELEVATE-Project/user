const usersData = require('@db/users/queries')
const { faker } = require('@faker-js/faker')
const utilsHelper = require('@generics/utils')

let bodyData

const insertUser = async () => {
	try {
		let email = 'nevil' + Math.random() + '@tunerlabs.com'

		bodyData = {
			name: 'Nevil',
			email: { address: email, verified: false },
			password: 'testing',
			isAMentor: false,
		}
		bodyData.password = utilsHelper.hashPassword(bodyData.password)
		await usersData.createUser(bodyData)
		return email
	} catch (error) {
		console.error(error)
	}
}

module.exports = {
	insertUser,
}
