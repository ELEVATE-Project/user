const usersData = require('@db/users/queries')
const { faker } = require('@faker-js/faker')
let bodyData
const insertMentor = async () => {
	try {
		bodyData = {
			name: 'Nevil (Mentor)',
			email: { address: faker.internet.email(), verified: false },
			password: faker.internet.password(),
			isAMentor: true,
			secretCode: 'secret-code',
		}
		await usersData.createUser(bodyData)
	} catch (error) {
		console.error(error)
	}
}

module.exports = {
	insertMentor,
}
