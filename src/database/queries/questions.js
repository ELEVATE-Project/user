const db = require('../models/index')
const Questions = db.questions
const createQuestion = async () => {
	try {
		const questionData = {
			name: 'Dummy Question',
			question: 'What is your favorite color?',
			options: ['Red', 'Blue', 'Green'],
			type: 'Multiple Choice',
			no_of_stars: null,
			status: 'Active',
			category: null,
			rendering_data: null,
			meta: null,
		}

		const newQuestion = await Questions.create(questionData)
		console.log('Question created successfully', newQuestion.id)
	} catch (error) {
		console.error('Error creating question:', error)
	}
}
const deleteQuestion = async (questionId) => {
	try {
		const deletedQuestion = await Questions.destroy({
			where: { id: questionId },
			force: false,
		})

		if (deletedQuestion > 0) {
			console.log('Question deleted successfully.')
		} else {
			console.log('Question not found.')
		}
	} catch (error) {
		console.error('Error deleting question:', error)
	}
}

const findQuestion = async (questionId) => {
	try {
		const question = await Questions.findOne({
			where: { id: questionId },
			attributes: { include: ['created_at', 'updatedAt', 'deletedAt'] },
			raw: true,
		})

		if (question) {
			console.log('Question found:', question)
		} else {
			console.log('Question not found.Please enter a valid question IDI')
		}
	} catch (error) {
		console.error('Error finding question:', error)
	}
}

createQuestion()

findQuestion(3) // Specify the question ID to find here

deleteQuestion(1) // Specify the question ID to delete here
