const Feedback = require('../models/index').Feedback

module.exports = class QuestionsData {
	static async createFeedback(data) {
		try {
			const feedback = await Feedback.create(data)
			return feedback
		} catch (error) {
			throw error
		}
	}

	static async findOne(filter, projection = {}) {
		try {
			const feedback = await Feedback.findOne({
				where: filter,
				attributes: projection,
				raw: true,
			})
			return feedback
		} catch (error) {
			return error
		}
	}

	static async findAll(filter, attributes = {}) {
		try {
			const feedbackData = await Feedback.findAll({
				where: filter,
				...attributes,
				raw: true,
			})
			return feedbackData
		} catch (error) {
			throw error
		}
	}

	static async bulkCreate(data) {
		try {
			const feedbacks = await Feedback.bulkCreate(data)
			return feedbacks
		} catch (error) {
			throw error
		}
	}
}
