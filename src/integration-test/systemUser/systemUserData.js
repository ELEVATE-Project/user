const systemUserData = require('@db/systemUsers/queries')
const utilsHelper = require('@generics/utils')
const { faker } = require('@faker-js/faker')

let bodyData
const insertAdminUser = async () => {
	try {
		let email = 'nevil' + Math.random() + '@admin.com'
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
