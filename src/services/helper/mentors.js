// Dependencies
const moment = require('moment-timezone')

const sessionsData = require('@db/sessions/queries')
const utils = require('@generics/utils')
const userProfile = require('./userProfile')
const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')
const ObjectId = require('mongoose').Types.ObjectId

const apiEndpoints = require('@constants/endpoints')
const apiBaseUrl = process.env.USER_SERIVCE_HOST + process.env.USER_SERIVCE_BASE_URL
const request = require('@generics/requests')
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
	static async upcomingSessions(id, page, limit, search = '') {
		try {
			const mentorsDetails = await userProfile.details('', id)
			if (mentorsDetails.data.result.isAMentor) {
				const filterUpcomingSession = {
					$and: [
						{
							startDate: {
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
					userId: id,
				}
				const upcomingSessions = await sessionsData.mentorsUpcomingSession(
					page,
					limit,
					search,
					filterUpcomingSession
				)
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
			console.log(err)
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
		const mentorsDetails = await userProfile.details('', id)
		if (mentorsDetails.data.result.isAMentor) {
			const filterSessionAttended = { userId: id, isSessionAttended: true }
			const totalSessionsAttended = await sessionAttendees.findAllSessionAttendees(filterSessionAttended)
			const filterSessionHosted = { userId: id, status: 'completed', isStarted: true }
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
	 * Share a mentor Profile.
	 * @method
	 * @name share
	 * @param {String} profileId - Profile id.
	 * @returns {JSON} - Shareable profile link.
	 */

	static share(profileId) {
		return new Promise(async (resolve, reject) => {
			const apiUrl = apiBaseUrl + apiEndpoints.SHARE_MENTOR_PROFILE + '/' + profileId
			try {
				let shareLink = await request.get(apiUrl, false, true)
				return resolve(
					common.successResponse({
						statusCode: httpStatusCode.ok,
						message: shareLink.data.message,
						result: shareLink.data.result,
					})
				)
			} catch (error) {
				reject(error)
			}
		})
	}
}
