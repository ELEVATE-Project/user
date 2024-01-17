const questionsData = require('@db/questions/queries')
const { faker } = require('@faker-js/faker')

let bodyData

const insertQuestion = async () => {
	try {
		const [type, subType, action] = [faker.random.alpha(5), faker.random.alpha(5), faker.random.alpha(5)]
		bodyData = {
			question: faker.lorem.sentence(),
			options: ['1', '2'],
			deleted: false,
			responseType: 'radio',
			value: '1',
			hint: '',
		}
		let question = await questionsData.createQuestion(bodyData)

		return question._id.valueOf()
	} catch (error) {
		console.error(error)
	}
}

module.exports = {
	insertQuestion,
}
