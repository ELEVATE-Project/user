const systemUserData = require('@db/systemUsers/queries')
const utilsHelper = require('@generics/utils')
const { faker } = require('@faker-js/faker')
const crypto = require('crypto')

let bodyData
const insertAdminUser = async () => {
	try {
		let email = 'nevil' + crypto.randomBytes(5).toString('hex') + '@admin.com'
		let password = faker.internet.password()

		bodyData = {
			name: 'Admin',
			email: { address: email, verified: false },
			password: password,
			role: 'admin',
		}
		bodyData.password = utilsHelper.hashPassword(bodyData.password)
		await systemUserData.create(bodyData)
		return { email: email, password: password }
	} catch (error) {
		console.error(error)
	}
}

module.exports = {
	insertAdminUser,
}
