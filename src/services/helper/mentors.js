// Dependencies
const sessionsData = require('@db/sessions/queries')
const utils = require('@generics/utils')
const userProfile = require('./userProfile')
const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')
const ObjectId = require('mongoose').Types.ObjectId

const sessionAttendees = require('@db/sessionAttendees/queries')

module.exports = class MentorsHelper {
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
			const totalSessionsAttended = await sessionAttendees.countAllSessionAttendees(filterSessionAttended)
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
}
