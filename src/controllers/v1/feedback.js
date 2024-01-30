/**
 * name : questions.js
 * author : Aman Gupta
 * created-date : 04-Nov-2021
 * Description : Question Controller.
 */

// Dependencies
const feedbackService = require('@services/feedback')
const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')
const responses = require('@helpers/responses')

module.exports = class Feedback {
	/**
	 * Feedback forms API
	 * @method
	 * @name forms
	 * @param {Object} req - request data.
	 * @param {String} req.params.id - form id.
	 * @param {String} req.decodedToken.isAMentor - User Mentor key.
	 * @returns {JSON} - returns feedback forms data.
	 */

	async forms(req) {
		try {
			const feedbackFormData = await feedbackService.forms(req.params.id, req.decodedToken.roles)
			return feedbackFormData
		} catch (error) {
			return error
		}
	}

	/**
	 * Feedback submit API
	 * @method
	 * @name submit
	 * @param {Object} req - request data.
	 * @param {String} req.params.id - form id.
	 * @param {Object} req.body - Form submission data.
	 * @param {String} req.decodedToken.id - User Id.
	 * @param {String} req.decodedToken.roles - User role.
	 * @returns {JSON} - returns feedback submission data.
	 */

	async submit(req) {
		try {
			const isAMentor = req.decodedToken.roles.some((role) => role.title == common.MENTOR_ROLE)
			if (isAMentor && !req.body.feedback_as) {
				return responses.failureResponse({
					message: 'FEEDBACK_AS_NOT_PASSED',
					statusCode: httpStatusCode.unprocessable_entity,
					responseCode: 'CLIENT_ERROR',
				})
			}
			const feedbackSubmitData = await feedbackService.submit(
				req.params.id,
				req.body,
				req.decodedToken.id,
				isAMentor
			)
			return feedbackSubmitData
		} catch (error) {
			return error
		}
	}
}
