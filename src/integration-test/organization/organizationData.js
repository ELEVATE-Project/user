const { request, orgAdminLogIn, logError, adminLogIn } = require('@commonTests')
const { faker } = require('@faker-js/faker')

const insertOrganization = async () => {
	try {
		userDetails = await adminLogIn()

		let res = await request
			.post('/user/v1/organization/create')
			.set({
				'X-auth-token': 'bearer ' + userDetails.token,
				Connection: 'keep-alive',
				'Content-Type': 'application/json',
			})
			.send({
				name: faker.random.alpha(5),
				code: faker.random.alpha(5),
				description: 'testing org',
				domains: ['cc.com'],
			})

		logError(res)
		return [res.body, userDetails.token]
	} catch (error) {
		console.error(error)
	}
}

module.exports = {
	insertOrganization,
}
