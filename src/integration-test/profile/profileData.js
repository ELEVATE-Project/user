const usersData = require('@db/users/queries')
const utilsHelper = require('@generics/utils')

let bodyData

const insertMentor = async () => {
	try {
		let email = 'nevil' + Math.random() + '@tunerlabs.com'

		bodyData = {
			name: 'Nevil',
			email: { address: email, verified: false },
			password: 'testing',
			isAMentor: true,
		}
		bodyData.password = utilsHelper.hashPassword(bodyData.password)
		await usersData.createUser(bodyData)
		const projection = {
			password: 0,
			refreshTokens: 0,
			'designation.deleted': 0,
			'designation._id': 0,
			'areasOfExpertise.deleted': 0,
			'areasOfExpertise._id': 0,
			'location.deleted': 0,
			'location._id': 0,
			otpInfo: 0,
		}
		let user = await usersData.findOne({ 'email.address': email }, projection)
		console.log(user._id)
		return user._id.valueOf()
	} catch (error) {
		console.error(error)
	}
}

module.exports = {
	insertMentor,
}
