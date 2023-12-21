//Dependencies
const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const questionsSetQueries = require('../database/queries/questionSet')
const questionQueries = require('../database/queries/questions')

module.exports = class questionsSetHelper {
	/**
	 * Create question set.
	 * @method
	 * @name create
	 * @param {Object} bodyData
	 * @returns {JSON} - Create question set
	 */

	static async create(bodyData, decodedToken) {
		try {
			let questions = await questionQueries.find({ id: bodyData.questions })
			if (questions.length != bodyData.questions.length) {
				return common.failureResponse({
					message: 'QUESTION_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			const questionSetData = {
				code: bodyData.code,
			}
			let questionSet = await questionsSetQueries.findOneQuestionsSet(questionSetData)
			if (questionSet) {
				return common.failureResponse({
					message: 'QUESTIONS_SET_ALREADY_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			questionSetData['questions'] = bodyData.questions
			questionSetData['created_by'] = decodedToken.id
			questionSetData['updated_by'] = decodedToken.id
			questionSet = await questionsSetQueries.createQuestionsSet(questionSetData)

			return common.successResponse({
				statusCode: httpStatusCode.created,
				message: 'QUESTIONS_SET_CREATED_SUCCESSFULLY',
				result: questionSet,
			})
		} catch (error) {
			console.log(error)
			throw error
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

	static async update(questionSetId, bodyData, decodedToken) {
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
				created_by: decodedToken.id,
				code: bodyData.code,
			}
			const questionSetData = {
				created_by: decodedToken.id,
				questions: bodyData.questions,
			}
			const questionSet = await questionsSetQueries.updateOneQuestionsSet(filter, questionSetData)
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
			console.log(error)
			throw error
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
				result: questionSet,
			})
		} catch (error) {
			throw error
		}
	}
}
