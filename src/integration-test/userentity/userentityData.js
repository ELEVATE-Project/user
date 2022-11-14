const userEntitiesData = require('@db/userentities/query')
const { faker } = require('@faker-js/faker')
let res, bodyData

const insertEntity = async () => {
	try {
		bodyData = {
			value: faker.random.alpha(5),
			label: faker.random.alpha(5),
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
