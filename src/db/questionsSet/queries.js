/**
 * name : models/questionsSet/query
 * author : Rakesh Kumar
 * Date : 01-Dec-2021
 * Description : Users database operations
 */

const QuestionsSet = require('./model')

module.exports = class QuestionsData {
	static async createQuestionsSet(data) {
		try {
			let questionSet = await new QuestionsSet(data).save()
			return questionSet
		} catch (error) {
			return error
		}
	}

	static async findOneQuestionsSet(filter, projection = {}) {
		try {
			const questionsSetData = await QuestionsSet.findOne(filter, projection)
			return questionsSetData
		} catch (error) {
			return error
		}
	}

	static async updateOneQuestionsSet(filter, update, options = {}) {
		try {
			const res = await QuestionsSet.updateOne(filter, update, options)
			if ((res.n === 1 && res.nModified === 1) || (res.matchedCount === 1 && res.modifiedCount === 1)) {
				return 'QUESTIONS_SET_UPDATED'
			} else if ((res.n === 1 && res.nModified === 0) || (res.matchedCount === 1 && res.modifiedCount === 0)) {
				return 'QUESTIONS_SET_ALREADY_EXISTS'
			} else {
				return 'QUESTIONS_SET_NOT_FOUND'
			}
		} catch (error) {
			return error
		}
	}
}
