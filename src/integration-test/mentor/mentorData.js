const usersData = require('@database/queries/users')
const { faker } = require('@faker-js/faker')
let bodyData
const insertMentor = async () => {
	try {
		bodyData = {
			name: 'Nevil (Mentor)',
			email: faker.internet.email(),
			password: faker.internet.password(),
			isAMentor: true,
			secret_code: 'secret-code',
			roles: 2,
			organization_id: 1,
		}
		await usersData.create(bodyData)
	} catch (error) {
		console.error(error)
	}
}

module.exports = {
	insertMentor,
}
