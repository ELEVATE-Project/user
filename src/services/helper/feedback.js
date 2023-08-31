// Dependencies
const sessionAttendees = require('@db/sessionAttendees/queries')
const sessionData = require('@db/sessions/queries')
const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')
const questionsSetData = require('@db/questionsSet/queries')
const questionsData = require('@db/questions/queries')
const ObjectId = require('mongoose').Types.ObjectId
const kafkaCommunication = require('@generics/kafka-communication')
const sessionQueries = require('@database/queries/sessions')
const questionSetQueries = require('@database/queries/questionSet')
const questionsQueries = require('@database/queries/questions')
const feedbackQueries = require('@database/queries/feedback')
const sessionAttendeesQueries = require('@database/queries/sessionAttendees')
const mentorExtensionQueries = require('@database/queries/mentorextension')

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
					deleted: false,
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

	static async forms(sessionId, roles) {
		try {
			let sessioninfo = await sessionQueries.findOne(
				{ id: sessionId },
				{
					attributes: ['mentee_feedback_question_set', 'mentor_feedback_question_set'],
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
			const isAMentor = roles.some((role) => role.title == common.MENTOR_ROLE)
			if (isAMentor) {
				formCode = sessioninfo.mentor_feedback_question_set
			} else {
				formCode = sessioninfo.mentee_feedback_question_set
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
		let feedback_as
		if (isAMentor) {
			feedback_as = updateData.feedback_as
			delete updateData.feedback_as
		}
		try {
			let sessionInfo = await sessionQueries.findOne(
				{ id: sessionId },
				{
					attributes: ['is_feedback_skipped', 'mentor_id'],
				}
			)

			if (!sessionInfo) {
				return common.failureResponse({
					message: 'SESSION_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const feedbacks = await feedbackQueries.findAll({
				session_id: sessionId,
				user_id: userId,
			})

			let feedbackNotExists = []
			if (feedbacks && feedbacks.length > 0) {
				feedbackNotExists = updateData.feedbacks.filter(
					(data) => !feedbacks.some((feedback) => data.question_id == feedback.question_id)
				)
			} else {
				feedbackNotExists = updateData.feedbacks
			}

			feedbackNotExists.map(async function (feedback) {
				feedback.session_id = sessionId
				feedback.user_id = userId
			})

			if (isAMentor && feedback_as === 'mentor') {
				if (
					sessionInfo.is_feedback_skipped == true ||
					(feedbacks.length > 0 && feedbackNotExists.length == 0)
				) {
					return common.failureResponse({
						message: 'FEEDBACK_ALREADY_SUBMITTED',
						statusCode: httpStatusCode.bad_request,
						responseCode: 'CLIENT_ERROR',
					})
				}

				await feedbackQueries.bulkCreate(feedbackNotExists)

				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'FEEDBACK_SUBMITTED',
				})
			} else {
				const sessionAttendesInfo = await sessionAttendeesQueries.findOne(
					{
						session_id: sessionId,
						mentee_id: userId,
					},
					{
						attributes: ['is_feedback_skipped'],
					}
				)

				if (
					sessionAttendesInfo.is_feedback_skipped == true ||
					(feedbacks.length > 0 && feedbackNotExists.length == 0)
				) {
					return common.failureResponse({
						message: 'FEEDBACK_ALREADY_SUBMITTED',
						statusCode: httpStatusCode.bad_request,
						responseCode: 'CLIENT_ERROR',
					})
				}

				await feedbackQueries.bulkCreate(feedbackNotExists)
				if (!updateData.is_feedback_skipped) {
					feedbackNotExists.map(async function (feedbackInfo) {
						let questionData = await questionsQueries.findOneQuestion({
							id: feedbackInfo.question_id,
						})

						if (
							questionData &&
							questionData.category &&
							questionData.category.evaluating == common.MENTOR_EVALUATING
						) {
							await ratingCalculation(feedbackInfo, sessionInfo.mentor_id)
						}
					})
				}

				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'FEEDBACK_SUBMITTED',
				})
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
		let questionsSet = await questionSetQueries.findOneQuestionsSet({
			code: formCode,
		})

		let result = {}
		if (questionsSet && questionsSet.questions) {
			let questions = await questionsQueries.find({
				id: questionsSet.questions,
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

/**
 * Rating Calculation
 * @method
 * @name ratingCalculation
 * @param {Object} feedbackData - feedback data
 * @param {String} mentor_id - mentor id
 * @returns {JSON} - mentor data.
 */

const ratingCalculation = async function (ratingData, mentor_id) {
	try {
		let mentorDetails = await mentorExtensionQueries.getMentorExtension(mentor_id)
		let mentorRating = mentorDetails.rating
		let updateData
		if (mentorRating.average && mentorRating.average) {
			let totalRating = parseFloat(ratingData.response)
			let ratingBreakup = []
			if (mentorRating.breakup && mentorRating.breakup.length > 0) {
				let breakupFound = false
				ratingBreakup = await Promise.all(
					mentorRating.breakup.map((breakupData) => {
						totalRating = totalRating + parseFloat(breakupData.star * breakupData.votes)

						if (breakupData['star'] == Number(ratingData.response)) {
							breakupFound = true
							return {
								star: breakupData.star,
								votes: breakupData.votes + 1,
							}
						} else {
							return breakupData
						}
					})
				)

				if (!breakupFound) {
					ratingBreakup.push({
						star: Number(ratingData.response),
						votes: 1,
					})
				}
			}

			let totalVotesCount = mentorRating.votes + 1
			let avg = Math.round(parseFloat(totalRating) / totalVotesCount)
			updateData = {
				rating: {
					average: avg,
					votes: totalVotesCount,
					breakup: ratingBreakup,
				},
			}
		} else {
			updateData = {
				rating: {
					average: parseFloat(ratingData.response),
					votes: 1,
					breakup: [
						{
							star: Number(ratingData.response),
							votes: 1,
						},
					],
				},
			}
		}

		await mentorExtensionQueries.updateMentorExtension(mentor_id, updateData)
		return
	} catch (error) {
		return error
	}
}
