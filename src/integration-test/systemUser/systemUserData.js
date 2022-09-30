const systemUserData = require('@db/systemUsers/queries')
const utilsHelper = require('@generics/utils')

let bodyData
const insertAdminUser = async () => {
	try {
		let email = 'nevil' + Math.random() + '@admin.com'
		bodyData = {
			name: 'Admin',
			email: { address: email, verified: false },
			password: 'testing',
			role: 'admin',
		}
		bodyData.password = utilsHelper.hashPassword(bodyData.password)
		await systemUserData.create(bodyData)
		return email
	} catch (error) {
		console.error(error)
	}
}

module.exports = {
	insertAdminUser,
}
