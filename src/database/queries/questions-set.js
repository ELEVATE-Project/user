const QuestionsSet = require('../models/index').QuestionSet

module.exports = class QuestionsData {
	static async createQuestionsSet(data) {
		try {
			const questionSet = await QuestionsSet.create(data)
			return questionSet
		} catch (error) {
			throw error
		}
	}

	static async findOneQuestionsSet(filter, projection = {}) {
		try {
			const questionSet = await QuestionsSet.findOne({
				where: filter,
				attributes: projection,
				raw: true,
			})
			return questionSet
		} catch (error) {
			return error
		}
	}

	static async updateOneQuestionsSet(filter, update, options = {}) {
		try {
			const [rowsAffected] = await QuestionsSet.update(update, {
				where: filter,
				...options,
			})
			return rowsAffected > 0 ? 'QUESTIONS_SET_UPDATED' : 'QUESTIONS_SET_NOT_FOUND'
		} catch (error) {
			return error
		}
	}

	static async findQuestionsSets(filter, projection) {
		try {
			const questionSets = await QuestionsSet.findAll({
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
