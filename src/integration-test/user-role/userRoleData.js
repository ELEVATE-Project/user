const { request, adminLogIn, logError } = require('@commonTests')

const { faker } = require('@faker-js/faker')

const insertUserRole = async () => {
	try {
		userDetails = await adminLogIn()

		let name = faker.lorem.word().toLowerCase()
		let res = await request
			.post('/user/v1/user-role/create')
			.set({
				'X-auth-token': 'bearer ' + userDetails.token,
				Connection: 'keep-alive',
				'Content-Type': 'application/json',
			})
			.send({
				title: name,
				user_type: 1,
				status: 'ACTIVE',
				visibility: 'PUBLIC',
			})
		res = await request
			.get('/user/v1/user-role/list')
			.set({
				'X-auth-token': 'bearer ' + userDetails.token,
				Connection: 'keep-alive',
				'Content-Type': 'application/json',
			})
			.query({ page: 1, limit: 10, search: name })
		return [res.body.result.data[0].id, userDetails.token]
	} catch (error) {
		console.error(error)
	}
}

module.exports = {
	insertUserRole,
}
