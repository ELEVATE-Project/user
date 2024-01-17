/**
 * name : questionsSet.js
 * author : Rakesh Kumar
 * created-date : 01-Dec-2021
 * Description : Question Controller.
 */

// Dependencies
const questionsService = require('@services/questionsSet')
const utilsHelper = require('@generics/utils')
const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')

module.exports = class QuestionsSet {
	/**
	 * create questions set
	 * @method
	 * @name create
	 * @param {Object} req -request data.
	 * @returns {JSON} - Questions Set creation.
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
			const createQuestionsSet = await questionsService.create(req.body, req.decodedToken)
			return createQuestionsSet
		} catch (error) {
			return error
		}
	}

	/**
	 * update questions set
	 * @method
	 * @name update
	 * @param {Object} req -request data.
	 * @param {String} req.params.id - question set id.
	 * @returns {JSON} - Questions Set updation.
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
			const updateQuestionsSet = await questionsService.update(req.params.id, req.body, req.decodedToken)
			return updateQuestionsSet
		} catch (error) {
			return error
		}
	}

	/**
	 * read questions set
	 * @method
	 * @name read
	 * @param {Object} req -request data.
	 * @param {String} req.params.id - question set id.
	 * @returns {JSON} - Questions set data.
	 */

	async read(req) {
		try {
			const questionsSetData = await questionsService.read(req.params.id, req.body.code)
			return questionsSetData
		} catch (error) {
			return error
		}
	}
}
