const questionsSetData = require('@db/questionsSet/queries')
const { faker } = require('@faker-js/faker')

let bodyData

const insertQuestionSet = async () => {
	try {
		//const [type, subType, action] = [faker.random.alpha(5), faker.random.alpha(5), faker.random.alpha(5)]
		bodyData = {
			questions: [faker.database.mongodbObjectId(), faker.database.mongodbObjectId()],
			code: faker.random.alpha(5),
		}
		let data = await questionsSetData.createQuestionSet(bodyData)
		//console.log(data)
		return data._id.valueOf()
	} catch (error) {
		console.error(error)
	}
}

module.exports = {
	insertQuestionSet,
}
