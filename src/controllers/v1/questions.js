/**
 * name : questions.js
 * author : Aman Gupta
 * created-date : 04-Nov-2021
 * Description : Question Controller.
 */

// Dependencies
const questionsService = require('@services/questions')
const utilsHelper = require('@generics/utils')
const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')

module.exports = class Questions {
	/**
	 * create questions
	 * @method
	 * @name create
	 * @param {Object} req -request data.
	 * @returns {JSON} - Question creation object.
	 */

	async create(req) {
		try {
			if (!utilsHelper.validateRoleAccess(req.decodedToken.roles, [common.ADMIN_ROLE, common.ORG_ADMIN_ROLE])) {
				throw common.failureResponse({
					message: 'USER_IS_NOT_A_ADMIN',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			const createdQuestion = await questionsService.create(req.body, req.decodedToken)
			return createdQuestion
		} catch (error) {
			return error
		}
	}

	/**
	 * updates question
	 * @method
	 * @name update
	 * @param {Object} req - request data.
	 * @returns {JSON} - Question updation response.
	 */

	async update(req) {
		try {
			if (!utilsHelper.validateRoleAccess(req.decodedToken.roles, [common.ADMIN_ROLE, common.ORG_ADMIN_ROLE])) {
				throw common.failureResponse({
					message: 'USER_IS_NOT_A_ADMIN',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			const updatedQuestion = await questionsService.update(req.params.id, req.body, req.decodedToken)
			return updatedQuestion
		} catch (error) {
			return error
		}
	}

	/**
	 * reads question
	 * @method
	 * @name read
	 * @param {Object} req -request data.
	 * @returns {JSON} - question object.
	 */

	async read(req) {
		try {
			const questionData = await questionsService.read(req.params.id)
			return questionData
		} catch (error) {
			return error
		}
	}
}
