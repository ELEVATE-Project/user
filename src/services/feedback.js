// Dependencies
const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')
const sessionQueries = require('@database/queries/sessions')
const questionSetQueries = require('@database/queries/questionSet')
const questionsQueries = require('@database/queries/questions')
const feedbackQueries = require('@database/queries/feedback')
const sessionAttendeesQueries = require('@database/queries/sessionAttendees')
const mentorExtensionQueries = require('@database/queries/mentorExtension')

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
			const sessions = []
			const completedSessionsFeedback = await feedbackQueries.findAll({ user_id: userId })
			const completedSessionIds = completedSessionsFeedback.map((feedback) => feedback.session_id)

			if (isAMentor) {
				const options = {
					attributes: ['id', 'title', 'description', 'mentor_feedback_question_set'],
				}

				const sessionDetails = await sessionQueries.mentorsSessionWithPendingFeedback(
					userId,
					options,
					completedSessionIds
				)

				sessions.push(...sessionDetails)
			}

			const menteeSessionAttendances = await sessionAttendeesQueries.findPendingFeedbackSessions(
				userId,
				completedSessionIds
			)

			const sessionIds = menteeSessionAttendances.map(
				(menteeSessionAttendance) => menteeSessionAttendance.session_id
			)

			const sessionOptions = {
				attributes: ['id', 'title', 'description', 'mentee_feedback_question_set'],
			}

			const menteeSessionDetails = await sessionQueries.findAll(
				{ id: sessionIds, status: 'COMPLETED' },
				sessionOptions
			)

			sessions.push(...menteeSessionDetails)

			// Getting unique form codes
			const formCodes = [
				...new Set(
					sessions.map(
						(session) => session.mentee_feedback_question_set || session.mentor_feedback_question_set
					)
				),
			]

			// Fetch feedback form data
			const feedbackForm = {}

			for (const formCode of formCodes) {
				const formData = await getFeedbackQuestions(formCode)
				if (formData) {
					feedbackForm[formCode] = formData
				}
			}

			// Attach feedback forms to sessions
			for (const sessionData of sessions) {
				const formCode = sessionData.mentee_feedback_question_set || sessionData.mentor_feedback_question_set
				sessionData['form'] = feedbackForm[formCode] || []
			}

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
			console.error(error)
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
			//get session details
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

			//get the feedbacks
			const feedbacks = await feedbackQueries.findAll({
				session_id: sessionId,
				user_id: userId,
			})

			//check the feedback is exist
			let feedbackNotExists = []
			if (updateData.feedbacks && updateData.feedbacks.length > 0) {
				if (feedbacks && feedbacks.length > 0) {
					feedbackNotExists = updateData.feedbacks.filter(
						(data) => !feedbacks.some((feedback) => data.question_id == feedback.question_id)
					)
				} else {
					feedbackNotExists = updateData.feedbacks
				}
			}

			if (feedbackNotExists && feedbackNotExists.length > 0) {
				feedbackNotExists.map(async function (feedback) {
					feedback.session_id = sessionId
					feedback.user_id = userId
				})
			}

			//mentor feedback
			if (isAMentor && feedback_as === 'mentor') {
				//check for already submitted feedback
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

				//update session
				if (updateData.is_feedback_skipped) {
					const rowsAffected = await sessionQueries.updateOne({ id: sessionId }, updateData)
					if (rowsAffected == 0) {
						return common.failureResponse({
							message: 'SESSION_NOT_FOUND',
							statusCode: httpStatusCode.bad_request,
							responseCode: 'CLIENT_ERROR',
						})
					}
				}

				//create feedback
				if (feedbackNotExists && feedbackNotExists.length > 0) {
					await feedbackQueries.bulkCreate(feedbackNotExists)
				}

				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'FEEDBACK_SUBMITTED',
				})
			} else {
				// mentee feedback
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

				if (updateData.is_feedback_skipped) {
					const attendeeRowsAffected = await sessionAttendeesQueries.updateOne(
						{
							session_id: sessionId,
							mentee_id: userId,
						},
						updateData
					)
					if (attendeeRowsAffected[0] == 0) {
						return common.failureResponse({
							message: 'SESSION_NOT_FOUND',
							statusCode: httpStatusCode.bad_request,
							responseCode: 'CLIENT_ERROR',
						})
					}
				} else {
					if (feedbackNotExists && feedbackNotExists.length > 0) {
						await feedbackQueries.bulkCreate(feedbackNotExists)
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
				}

				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'FEEDBACK_SUBMITTED',
				})
			}
		} catch (error) {
			console.log(error, 'error')
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

		if (mentorRating?.average || mentorRating !== null) {
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
