// Dependencies
const sessionAttendees = require('@db/sessionAttendees/queries')
const sessionData = require('@db/sessions/queries')
const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')
const questionsSetData = require('@db/questionsSet/queries')
const questionsData = require('@db/questions/queries')
const ObjectId = require('mongoose').Types.ObjectId
const kafkaCommunication = require('@generics/kafka-communication')

module.exports = class MenteesHelper {
	/**
	 * Pending feedback.
	 * @method
	 * @name pending
	 * @param {String} userId - user id.
	 * @param {Boolean} isAMentor
	 * @returns {JSON} - pending feedback.
	 */

	static async pending(userId, isAMentor) {
		try {
			let sessions = []

			if (isAMentor) {
				let filters = {
					status: 'completed',
					skippedFeedback: false,
					isStarted: true,
					feedbacks: {
						$size: 0,
					},
					userId: ObjectId(userId),
				}
				let mentorSessions = await sessionData.findSessions(filters, {
					_id: 1,
					title: 1,
					description: 1,
					mentorFeedbackForm: 1,
				})

				sessions = mentorSessions
			}

			let sessionAttendeesFilter = {
				'sessionDetail.status': 'completed',
				isSessionAttended: true,
				skippedFeedback: false,
				feedbacks: {
					$size: 0,
				},
				userId: ObjectId(userId),
			}
			let menteeSessionAttendence = await sessionAttendees.findPendingFeedbackSessions(sessionAttendeesFilter)

			if (menteeSessionAttendence && menteeSessionAttendence.length > 0) {
				menteeSessionAttendence.forEach((sessionData) => {
					if (sessionData.sessionDetail) {
						let found = sessions.find(
							(session) => session._id.toString() === sessionData.sessionDetail._id.toString()
						)
						if (!found) {
							sessions.push(sessionData.sessionDetail)
						}
					}
				})
			}

			let formCodes = []
			await Promise.all(
				sessions.map(function (session) {
					let formCode
					if (session.menteeFeedbackForm) {
						formCode = session.menteeFeedbackForm
					} else if (session.mentorFeedbackForm) {
						formCode = session.mentorFeedbackForm
					}
					if (formCode && !formCodes.includes(formCode)) {
						formCodes.push(formCode)
					}
				})
			)

			let feedbackForm = {}
			await Promise.all(
				formCodes.map(async function (formCode) {
					let formData = await getFeedbackQuestions(formCode)
					if (formData) {
						feedbackForm[formCode] = formData
					}
				})
			)

			sessions.map(async function (sessionData) {
				var formCode = ''
				if (sessionData.menteeFeedbackForm) {
					formCode = sessionData.menteeFeedbackForm
				} else if (sessionData.mentorFeedbackForm) {
					formCode = sessionData.mentorFeedbackForm
				}
				if (formCode && feedbackForm[formCode]) {
					sessionData['form'] = feedbackForm[formCode]
				} else {
					sessionData['form'] = []
				}
				return sessionData
			})

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'PENDING_FEEDBACK_FETCHED_SUCCESSFULLY',
				result: sessions,
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * Feedback forms.
	 * @method
	 * @name forms
	 * @param {String} sessionId - session id.
	 * @param {Boolean} isAMentor
	 * @returns {JSON} - Feedback forms.
	 */

	static async forms(sessionId, isAMentor) {
		try {
			let sessioninfo = await sessionData.findOneSession(
				{
					_id: sessionId,
				},
				{
					mentorFeedbackForm: 1,
					menteeFeedbackForm: 1,
				}
			)
			if (!sessioninfo) {
				return common.failureResponse({
					message: 'SESSION_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			let formCode
			if (isAMentor) {
				formCode = sessioninfo.mentorFeedbackForm
			} else {
				formCode = sessioninfo.menteeFeedbackForm
			}

			let formData = await getFeedbackQuestions(formCode)

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'FEEDBACKFORM_MESSAGE',
				result: {
					form: formData,
				},
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * Feedback submission.
	 * @method
	 * @name submit
	 * @param {String} sessionId - session id.
	 * @param {Object} updateData
	 * @param {String} userId - user id.
	 * @param {Boolean} isAMentor
	 * @returns {JSON} - Feedback submission.
	 */

	static async submit(sessionId, updateData, userId, isAMentor) {
		let feedbackAs
		if (isAMentor) {
			feedbackAs = updateData.feedbackAs
			delete updateData.feedbackAs
		}
		try {
			let sessionInfo = await sessionData.findOneSession(
				{
					_id: sessionId,
				},
				{
					_id: 1,
					skippedFeedback: 1,
					feedbacks: 1,
					userId: 1,
				}
			)
			if (!sessionInfo) {
				return common.failureResponse({
					message: 'SESSION_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			if (isAMentor && feedbackAs === 'mentor') {
				if (
					sessionInfo.skippedFeedback == true ||
					(sessionInfo.feedbacks && sessionInfo.feedbacks.length > 0)
				) {
					return common.failureResponse({
						message: 'FEEDBACK_ALREADY_SUBMITTED',
						statusCode: httpStatusCode.bad_request,
						responseCode: 'CLIENT_ERROR',
					})
				}

				const result = await sessionData.updateOneSession(
					{
						_id: sessionId,
						userId: userId,
					},
					updateData
				)

				if (result == 'SESSION_NOT_FOUND') {
					return common.failureResponse({
						message: 'SESSION_NOT_FOUND',
						statusCode: httpStatusCode.bad_request,
						responseCode: 'CLIENT_ERROR',
					})
				} else {
					return common.successResponse({
						statusCode: httpStatusCode.ok,
						message: 'FEEDBACK_SUBMITTED',
					})
				}
			} else {
				let sessionAttendesInfo = await sessionAttendees.findOneSessionAttendee(sessionId, userId)
				if (
					(sessionAttendesInfo.skippedFeedback && sessionAttendesInfo.skippedFeedback == true) ||
					(sessionAttendesInfo.feedbacks && sessionAttendesInfo.feedbacks.length > 0)
				) {
					return common.failureResponse({
						message: 'FEEDBACK_ALREADY_SUBMITTED',
						statusCode: httpStatusCode.bad_request,
						responseCode: 'CLIENT_ERROR',
					})
				}

				const result = await sessionAttendees.updateOne(
					{
						sessionId: sessionId,
						userId: userId,
					},
					updateData
				)
				if (!updateData.skippedFeedback) {
					updateData.feedbacks.map(async function (feedbackInfo) {
						let questionData = await questionsData.findOneQuestion({ _id: feedbackInfo.questionId })
						if (questionData && questionData.evaluating == common.MENTOR_EVALUATING) {
							let data = {
								type: 'MENTOR_RATING',
								mentorId: sessionInfo.userId,
								...feedbackInfo,
							}
							kafkaCommunication.pushMentorRatingToKafka(data)
						}
					})
				}

				if (result == 'SESSION_ATTENDENCE_NOT_FOUND') {
					return common.failureResponse({
						message: 'SESSION_NOT_FOUND',
						statusCode: httpStatusCode.bad_request,
						responseCode: 'CLIENT_ERROR',
					})
				} else {
					return common.successResponse({
						statusCode: httpStatusCode.ok,
						message: 'FEEDBACK_SUBMITTED',
					})
				}
			}
		} catch (error) {
			throw error
		}
	}
}

/**
 * Get Feedback Questions.
 * @method
 * @name getFeedbackQuestions
 * @param {String} formCode - form code
 * @returns {JSON} - Feedback forms.
 */

const getFeedbackQuestions = async function (formCode) {
	try {
		let questionsSet = await questionsSetData.findOneQuestionsSet({
			code: formCode,
		})

		let result = {}
		if (questionsSet && questionsSet.questions) {
			let questions = await questionsData.find({
				_id: {
					$in: questionsSet.questions,
				},
			})

			if (questions && questions.length > 0) {
				questions.map((data) => {
					if (data.question) {
						data['label'] = data.question
						delete data.question
						return data
					}
				})
				result = questions
			}
		}
		return result
	} catch (error) {
		return error
	}
}
