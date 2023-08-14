// Dependencies
const moment = require('moment-timezone')

const sessionsData = require('@db/sessions/queries')
const utils = require('@generics/utils')
const userProfile = require('./userProfile')
const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')
const ObjectId = require('mongoose').Types.ObjectId
const sessionAttendees = require('@db/sessionAttendees/queries')

const mentorQueries = require('../../database/queries/mentorextention')
const { UniqueConstraintError } = require('sequelize')

module.exports = class MentorsHelper {
	/**
	 * upcomingSessions.
	 * @method
	 * @name upcomingSessions
	 * @param {String} id - user id.
	 * @param {String} page - Page No.
	 * @param {String} limit - Page size limit.
	 * @param {String} search - Search text.
	 * @returns {JSON} - mentors upcoming session details
	 */
	static async upcomingSessions(id, page, limit, search = '', menteeUserId) {
		try {
			const mentorsDetails = await userProfile.details('', id)

			if (mentorsDetails?.data?.result?.isAMentor) {
				const filterUpcomingSession = {
					$and: [
						{
							startDateUtc: {
								$gt: moment().utc().format(common.UTC_DATE_TIME_FORMAT),
							},
						},
						{
							status: 'published',
						},
						{
							isStarted: false,
						},
					],
					userId: mentorsDetails.data.result._id,
				}
				let upcomingSessions = await sessionsData.mentorsUpcomingSession(
					page,
					limit,
					search,
					filterUpcomingSession
				)

				upcomingSessions[0].data = await this.sessionMentorDetails(upcomingSessions[0].data)
				if (menteeUserId && id != menteeUserId) {
					upcomingSessions[0].data = await this.menteeSessionDetails(upcomingSessions[0].data, menteeUserId)
				}
				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'UPCOMING_SESSION_FETCHED',
					result: upcomingSessions,
				})
			} else {
				return common.failureResponse({
					statusCode: httpStatusCode.bad_request,
					message: 'MENTORS_NOT_FOUND',
					responseCode: 'CLIENT_ERROR',
				})
			}
		} catch (err) {
			return err
		}
	}

	/**
	 * Profile.
	 * @method
	 * @name profile
	 * @param {String} userId - user id.
	 * @returns {JSON} - profile details
	 */
	static async profile(id) {
		try {
			const mentorsDetails = await userProfile.details('', id)
			if (mentorsDetails.data.result.isAMentor && mentorsDetails.data.result.deleted === false) {
				const _id = mentorsDetails.data.result._id
				const filterSessionAttended = { userId: _id, isSessionAttended: true }
				const totalSessionsAttended = await sessionAttendees.countAllSessionAttendees(filterSessionAttended)
				const filterSessionHosted = { userId: _id, status: 'completed', isStarted: true, delete: false }
				const totalSessionHosted = await sessionsData.findSessionHosted(filterSessionHosted)
				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'PROFILE_FTECHED_SUCCESSFULLY',
					result: {
						sessionsAttended: totalSessionsAttended,
						sessionsHosted: totalSessionHosted,
						...mentorsDetails.data.result,
					},
				})
			} else {
				return common.failureResponse({
					statusCode: httpStatusCode.bad_request,
					message: 'MENTORS_NOT_FOUND',
					responseCode: 'CLIENT_ERROR',
				})
			}
		} catch (err) {
			return err
		}
	}

	/**
	 * Mentors reports.
	 * @method
	 * @name reports
	 * @param {String} userId - user id.
	 * @param {String} filterType - MONTHLY/WEEKLY/QUARTERLY.
	 * @returns {JSON} - Mentors reports
	 */

	static async reports(userId, filterType) {
		let filterStartDate
		let filterEndDate
		let totalSessionCreated
		let totalsessionHosted
		let filters
		try {
			if (filterType === 'MONTHLY') {
				;[filterStartDate, filterEndDate] = utils.getCurrentMonthRange()
			} else if (filterType === 'WEEKLY') {
				;[filterStartDate, filterEndDate] = utils.getCurrentWeekRange()
			} else if (filterType === 'QUARTERLY') {
				;[filterStartDate, filterEndDate] = utils.getCurrentQuarterRange()
			}

			/* totalSessionCreated */
			filters = {
				createdAt: {
					$gte: filterStartDate.toISOString(),
					$lte: filterEndDate.toISOString(),
				},
				userId: ObjectId(userId),
				deleted: false,
			}

			totalSessionCreated = await sessionsData.countSessions(filters)

			/* totalsessionHosted */
			filters = {
				startDateUtc: {
					$gte: filterStartDate.toISOString(),
					$lte: filterEndDate.toISOString(),
				},
				userId: ObjectId(userId),
				status: 'completed',
				deleted: false,
				isStarted: true,
			}

			totalsessionHosted = await sessionsData.countSessions(filters)
			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'MENTORS_REPORT_FETCHED_SUCCESSFULLY',
				result: { totalSessionCreated, totalsessionHosted },
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * Shareable mentor profile link.
	 * @method
	 * @name share
	 * @param {String} _id - Mentors user id.
	 * @returns {JSON} - Returns sharable link of the mentor.
	 */
	static async share(_id) {
		try {
			const shareLink = await userProfile.share(_id)
			return shareLink
		} catch (error) {
			return error
		}
	}

	static async sessionMentorDetails(session) {
		try {
			if (session.length > 0) {
				const userIds = session
					.map((item) => item.userId.toString())
					.filter((value, index, self) => self.indexOf(value) === index)

				let mentorDetails = await userProfile.getListOfUserDetails(userIds)
				mentorDetails = mentorDetails.result
				for (let i = 0; i < session.length; i++) {
					let mentorIndex = mentorDetails.findIndex((x) => x._id === session[i].userId.toString())
					session[i].mentorName = mentorDetails[mentorIndex].name
				}

				await Promise.all(
					session.map(async (sessions) => {
						if (sessions.image && sessions.image.length > 0) {
							sessions.image = sessions.image.map(async (imgPath) => {
								if (imgPath && imgPath != '') {
									return await utils.getDownloadableUrl(imgPath)
								}
							})
							sessions.image = await Promise.all(sessions.image)
						}
					})
				)

				return session
			} else {
				return session
			}
		} catch (error) {
			throw error
		}
	}

	static async menteeSessionDetails(sessions, userId) {
		try {
			const sessionIds = []
			if (sessions.length > 0) {
				sessions.forEach((session) => {
					sessionIds.push(session._id)
				})

				const filters = {
					sessionId: {
						$in: sessionIds,
					},
					userId,
				}
				const attendees = await sessionAttendees.findAllSessionAttendees(filters)
				await Promise.all(
					sessions.map(async (session) => {
						if (attendees) {
							const attendee = attendees.find(
								(attendee) => attendee.sessionId.toString() === session._id.toString()
							)
							session.isEnrolled = false
							if (attendee) {
								session.isEnrolled = true
							}
						} else {
							session.isEnrolled = false
						}
					})
				)
				return sessions
			} else {
				return sessions
			}
		} catch (err) {
			return err
		}
	}

	//Functions for new APIS
	/**
	 * Create a new mentor extension.
	 * @method
	 * @name createMentorExtension
	 * @param {Object} data - Mentor extension data to be created.
	 * @param {String} userId - User ID of the mentor.
	 * @returns {Promise<Object>} - Created mentor extension details.
	 */
	static async createMentorExtension(data, userId) {
		try {
			data.user_id = userId
			console.log(data)
			const response = await mentorQueries.createMentorExtension(data)
			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'MENTOR_EXTENSION_CREATED',
				result: response,
			})
		} catch (error) {
			if (error instanceof UniqueConstraintError) {
				return common.failureResponse({
					message: 'MENTOR_EXTENSION_CREATION_FAILED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			return error
		}
	}

	/**
	 * Update a mentor extension.
	 * @method
	 * @name updateMentorExtension
	 * @param {String} userId - User ID of the mentor.
	 * @param {Object} data - Updated mentor extension data excluding user_id.
	 * @returns {Promise<Object>} - Updated mentor extension details.
	 */
	static async updateMentorExtension(data, userId) {
		try {
			if (data.user_id) {
				delete data['user_id']
			}
			const [updateCount, updatedMentor] = await mentorQueries.updateMentorExtension(userId, data, {
				returning: true,
				raw: true,
			})

			if (updateCount === '0') {
				return common.failureResponse({
					statusCode: httpStatusCode.not_found,
					message: 'MENTOR_EXTENSION_NOT_FOUND',
				})
			}
			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'MENTOR_EXTENSION_UPDATED',
				result: updatedMentor,
			})
		} catch (error) {
			return error
		}
	}

	/**
	 * Get mentor extension details by user ID.
	 * @method
	 * @name getMentorExtension
	 * @param {String} userId - User ID of the mentor.
	 * @returns {Promise<Object>} - Mentor extension details.
	 */
	static async getMentorExtension(userId) {
		try {
			const mentor = await mentorQueries.getMentorExtension(userId)
			if (!mentor) {
				return common.failureResponse({
					statusCode: httpStatusCode.not_found,
					message: 'MENTOR_EXTENSION_NOT_FOUND',
				})
			}
			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'MENTOR_EXTENSION_FETCHED',
				result: mentor,
			})
		} catch (error) {
			console.log(error)
			return error
		}
	}

	/**
	 * Delete a mentor extension by user ID.
	 * @method
	 * @name deleteMentorExtension
	 * @param {String} userId - User ID of the mentor.
	 * @returns {Promise<Object>} - Indicates if the mentor extension was deleted successfully.
	 */
	static async deleteMentorExtension(userId) {
		try {
			const deleteCount = await mentorQueries.deleteMentorExtension(userId)
			if (deleteCount === '0') {
				return common.failureResponse({
					statusCode: httpStatusCode.not_found,
					message: 'MENTOR_EXTENSION_NOT_FOUND',
				})
			}
			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'MENTOR_EXTENSION_DELETED',
			})
		} catch (error) {
			return error
		}
	}
}
