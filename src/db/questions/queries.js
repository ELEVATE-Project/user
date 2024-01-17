/**
 * name : models/questions/query
 * author : Rakesh Kumar
 * Date : 30-Nov-2021
 * Description : Users database operations
 */

const Questions = require('./model')

module.exports = class QuestionsData {
	static async createQuestion(data) {
		try {
			let question = await new Questions(data).save()
			return question
		} catch (error) {
			return error
		}
	}

	static async findOneQuestion(filter, projection = {}) {
		try {
			const questionData = await Questions.findOne(filter, projection)
			return questionData
		} catch (error) {
			return error
		}
	}

	static async find(filter, projection = {}) {
		try {
			const questionData = await Questions.find(filter, projection).lean()
			return questionData
		} catch (error) {
			return error
		}
	}

	static async updateOneQuestion(filter, update, options = {}) {
		try {
			const res = await Questions.updateOne(filter, update, options)
			if ((res.n === 1 && res.nModified === 1) || (res.matchedCount === 1 && res.modifiedCount === 1)) {
				return 'QUESTION_UPDATED'
			} else if ((res.n === 1 && res.nModified === 0) || (res.matchedCount === 1 && res.modifiedCount === 0)) {
				return 'QUESTION_ALREADY_EXISTS'
			} else {
				return 'QUESTION_NOT_FOUND'
			}
		} catch (error) {
			return error
		}
	}

	static async update(filter, update, options = {}) {
		try {
			const res = await Questions.update(filter, update, options)
			if ((res.n === 1 && res.nModified === 1) || (res.matchedCount === 1 && res.modifiedCount === 1)) {
				return 'QUESTION_UPDATED'
			} else if ((res.n === 1 && res.nModified === 0) || (res.matchedCount === 1 && res.modifiedCount === 0)) {
				return 'QUESTION_ALREADY_EXISTS'
			} else {
				return 'QUESTION_NOT_FOUND'
			}
		} catch (error) {
			return error
		}
	}
	static async updateData(filter, update, options = {}) {
		try {
			const res = await Questions.updateMany(filter, update, options)
			if ((res.n === 1 && res.nModified === 1) || (res.matchedCount === 1 && res.modifiedCount === 1)) {
				return 'QUESTION_UPDATED'
			} else if ((res.n === 1 && res.nModified === 0) || (res.matchedCount === 1 && res.modifiedCount === 0)) {
				return 'QUESTION_ALREADY_EXISTS'
			} else {
				return 'QUESTION_NOT_FOUND'
			}
		} catch (error) {
			return error
		}
	}
}
