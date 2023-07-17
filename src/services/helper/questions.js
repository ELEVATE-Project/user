const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const questionQueries = require('../../database/queries/questions')
module.exports = class questionsHelper {
	/**
	 * Create questions.
	 * @method
	 * @name create
	 * @param {Object} bodyData
	 * @returns {JSON} - Create questions
	 */

	static async create(bodyData) {
		try {
			let question = await questionQueries.createQuestion(bodyData)
			return common.successResponse({
				statusCode: httpStatusCode.created,
				message: 'QUESTION_CREATED_SUCCESSFULLY',
				result: question,
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * Update questions.
	 * @method
	 * @name update
	 * @param {String} questionId - question id.
	 * @param {Object} bodyData
	 * @returns {JSON} - Update questions.
	 */

	static async update(questionId, bodyData) {
		try {
			const filter = { id: questionId }
			const result = await questionQueries.updateOneQuestion(filter, bodyData)

			if (result === 'QUESTION_NOT_FOUND') {
				return common.failureResponse({
					message: 'QUESTION_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			return common.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'QUESTION_UPDATED_SUCCESSFULLY',
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * Read question.
	 * @method
	 * @name read
	 * @param {String} questionId - question id.
	 * @returns {JSON} - Read question.
	 */

	static async read(questionId) {
		try {
			const filter = { id: questionId }
			const question = await questionQueries.findOneQuestion(filter)
			if (!question) {
				return common.failureResponse({
					message: 'QUESTION_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'QUESTION_FETCHED_SUCCESSFULLY',
				result: question ? question : {},
			})
		} catch (error) {
			throw error
		}
	}
}
