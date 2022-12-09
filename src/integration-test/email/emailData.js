const entitiesData = require('@db/entities/query')
const { faker } = require('@faker-js/faker')

let bodyData

const insertEntity = async () => {
	//insert an entity
	try {
		const [value, label, type] = [faker.random.alpha(5), faker.random.alpha(5), faker.random.alpha(5)]
		bodyData = {
			value: value,
			label: label,
			type: type,
			updatedBy: faker.database.mongodbObjectId(),
			createdBy: faker.database.mongodbObjectId(),
		}
		await entitiesData.createEntity(bodyData)
		const entity = await entitiesData.findOneEntity(type, value)
		return entity._id.valueOf()
	} catch (error) {
		console.error(error)
	}
}

module.exports = {
	insertEntity,
}
