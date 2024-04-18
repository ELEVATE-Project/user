const { request, adminLogIn, logError } = require('@commonTests')

const { faker } = require('@faker-js/faker')

const insertEntity = async () => {
	try {
		userDetails = await adminLogIn()

		let res = await request
			.post('/user/v1/entity/create')
			.set({
				'X-auth-token': 'bearer ' + userDetails.token,
				Connection: 'keep-alive',
				'Content-Type': 'application/json',
			})
			.send({
				value: faker.random.alpha(5),
				label: faker.random.alpha(5),
				status: 'ACTIVE',
				type: 'roles',
				entity_type_id: 1,
			})
		return [res.body.result.id, userDetails.token]
	} catch (error) {
		console.error(error)
	}
}

module.exports = {
	insertEntity,
}
