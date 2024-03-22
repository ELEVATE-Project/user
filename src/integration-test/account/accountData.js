const usersData = require('@database/queries/users')
const UserCredentialQueries = require('@database/queries/userCredential')
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
			email: email,
			password: password,
			isAMentor: false,
			organization_id: 1,
			roles: [3],
			otp: process.env.ENABLE_EMAIL_OTP_VERIFICATION,
		}
		bodyData.password = utilsHelper.hashPassword(bodyData.password)
		const res = await usersData.create(bodyData)
		const userCredentialsBody = {
			email: email,
			password: password,
			organization_id: bodyData.organization_id,
			user_id: res.user_id,
		}
		await UserCredentialQueries.create(userCredentialsBody)

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
