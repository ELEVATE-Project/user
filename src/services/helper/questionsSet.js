//Dependencies
const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const questionsSetQueries = require('../../database/queries/questionSet')
const questionQueries = require('../../database/queries/questions')

module.exports = class questionsSetHelper {
	/**
	 * Create question set.
	 * @method
	 * @name create
	 * @param {Object} bodyData
	 * @returns {JSON} - Create question set
	 */

	static async create(bodyData) {
		try {
			let questions = await questionQueries.find({ id: bodyData.questions })
			if (questions.length != bodyData.questions.length) {
				return common.failureResponse({
					message: 'QUESTION_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			let questionSet = await questionsSetQueries.findOneQuestionsSet(bodyData)
			if (questionSet) {
				return common.failureResponse({
					message: 'QUESTIONS_SET_ALREADY_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			questionSet = await questionsSetQueries.createQuestionsSet(bodyData)

			return common.successResponse({
				statusCode: httpStatusCode.created,
				message: 'QUESTIONS_SET_CREATED_SUCCESSFULLY',
				result: questionSet,
			})
		} catch (error) {
			return error
		}
	}

	/**
	 * Update question set.
	 * @method
	 * @name update
	 * @param {String} questionSetId - questionset id.
	 * @param {Object} bodyData
	 * @returns {JSON} - Update question set.
	 */

	static async update(questionSetId, bodyData) {
		try {
			if (bodyData.questions) {
				let questionInfo = await questionQueries.find({ id: bodyData.questions })
				if (questionInfo.length != bodyData.questions.length) {
					return common.failureResponse({
						message: 'QUESTION_NOT_FOUND',
						statusCode: httpStatusCode.bad_request,
						responseCode: 'CLIENT_ERROR',
					})
				}
			}
			const filter = {
				id: questionSetId,
			}
			let questionSet = await questionsSetQueries.findOneQuestionsSet(bodyData)
			if (questionSet) {
				return common.failureResponse({
					message: 'QUESTIONS_SET_ALREADY_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			questionSet = await questionsSetQueries.updateOneQuestionsSet(filter, bodyData)

			if (questionSet === 'QUESTIONS_SET_NOT_FOUND') {
				return common.failureResponse({
					message: 'QUESTIONS_SET_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			return common.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'QUESTIONS_SET_UPDATED_SUCCESSFULLY',
			})
		} catch (error) {
			return error
		}
	}

	/**
	 * Read question set.
	 * @method
	 * @name read
	 * @param {String} questionsSetId - question set id.
	 * @returns {JSON} - Read question set.
	 */

	static async read(questionsSetId) {
		try {
			const filter = {
				id: questionsSetId,
			}
			const questionSet = await questionsSetQueries.findOneQuestionsSet(filter)
			if (!questionSet) {
				return common.failureResponse({
					message: 'QUESTION_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'QUESTIONS_SET_FETCHED_SUCCESSFULLY',
				result: questionSet ? questionSet : {},
			})
		} catch (error) {
			return error
		}
	}
}
