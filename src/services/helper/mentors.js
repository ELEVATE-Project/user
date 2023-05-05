// Dependencies
const moment = require('moment-timezone')

const sessionsData = require('@db/sessions/queries')
const utils = require('@generics/utils')
const userProfile = require('./userProfile')
const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')
const ObjectId = require('mongoose').Types.ObjectId
const sessionAttendees = require('@db/sessionAttendees/queries')

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
			if (mentorsDetails.data.result.isAMentor) {
				const _id = mentorsDetails.data.result._id
				const filterSessionAttended = { userId: _id, isSessionAttended: true }
				const totalSessionsAttended = await sessionAttendees.countAllSessionAttendees(filterSessionAttended)
				const filterSessionHosted = { userId: _id, status: 'completed', isStarted: true }
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
}
