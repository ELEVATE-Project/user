const QuestionSet = require('../models/index').QuestionSet

module.exports = class QuestionsData {
	static async createQuestionSet(data) {
		try {
			const questionSet = await QuestionSet.create(data)
			return questionSet
		} catch (error) {
			throw error
		}
	}

	static async findOneQuestionSet(filter, projection = {}) {
		try {
			const questionSet = await QuestionSet.findOne({
				where: filter,
				attributes: projection,
				raw: true,
			})
			return questionSet
		} catch (error) {
			return error
		}
	}

	static async updateOneQuestionSet(filter, update, options = {}) {
		try {
			const [rowsAffected] = await QuestionSet.update(update, {
				where: filter,
				...options,
			})
			return rowsAffected > 0 ? 'QUESTIONS_SET_UPDATED' : 'QUESTIONS_SET_NOT_FOUND'
		} catch (error) {
			return error
		}
	}

	static async findQuestionSets(filter, projection) {
		try {
			const questionSets = await QuestionSet.findAll({
				where: filter,
				attributes: projection,
				raw: true,
			})
			return questionSets
		} catch (error) {
			return error
		}
	}
}
