const userEntitiesData = require('@db/userentities/query')
const { faker } = require('@faker-js/faker')
let res, bodyData

const insertEntity = async () => {
	try {
		bodyData = {
			value: faker.word.adjective(),
			label: faker.word.adjective(),
			type: 'roles',
			updatedBy: faker.database.mongodbObjectId(),
			createdBy: faker.database.mongodbObjectId(),
		}
		res = await userEntitiesData.createEntity(bodyData)
		return res._id.valueOf()
	} catch (error) {
		console.error(error)
	}
}

module.exports = {
	insertEntity,
}
