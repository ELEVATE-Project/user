// Dependencies
const sessionsData = require('@db/sessions/queries')
const utils = require('@generics/utils')
const common = require('@constants/common')
const apiResponses = require('@constants/api-responses')
const httpStatusCode = require('@generics/http-status')
const ObjectId = require('mongoose').Types.ObjectId
const apiEndpoints = require('@constants/endpoints')
const request = require('request')
const sessionAttendees = require('@db/sessionAttendees/queries')
const apiBaseUrl = process.env.USER_SERIVCE_HOST + process.env.USER_SERIVCE_BASE_URL

module.exports = class MentorsHelper {
	/**
	 * Profile.
	 * @method
	 * @name profile
	 * @param {String} userId - user id.
	 * @returns {JSON} - profile details
	 */
	static async profile(id) {
		return new Promise((resolve, reject) => {
			const apiUrl = apiBaseUrl + apiEndpoints.USER_PROFILE_DETAILS + '/' + id

			var options = {
				headers: {
					'Content-Type': 'application/json',
					internal_access_token: process.env.INTERNAL_ACCESS_TOKEN,
				},
			}
			request.get(apiUrl, options, async (error, response) => {
				if (error) {
					reject(error)
				}
				const userDetails = JSON.parse(response.body)

				if (userDetails.result.isAMentor) {
					const filterSessionAttended = { userId: id, isSessionAttended: true }
					const totalSessionsAttended = await sessionAttendees.findAllSessionAttendees(filterSessionAttended)
					const filterSessionHosted = { userId: id, status: 'completed', isStarted: true }
					const totalSessionHosted = await sessionsData.findSessionHosted(filterSessionHosted)
					resolve(
						common.successResponse({
							statusCode: httpStatusCode.ok,
							message: apiResponses.PROFILE_FTECHED_SUCCESSFULLY,
							result: {
								sessionsAttended: totalSessionsAttended,
								sessionsHosted: totalSessionHosted,
								...userDetails.result,
							},
						})
					)
				} else {
					resolve(
						common.successResponse({
							statusCode: httpStatusCode.bad_request,
							message: apiResponses.MENTORS_NOT_FOUND,
							responseCode: 'CLIENT_ERROR',
						})
					)
				}
			})
		})
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
				message: apiResponses.MENTORS_REPORT_FETCHED_SUCCESSFULLY,
				result: { totalSessionCreated, totalsessionHosted },
			})
		} catch (error) {
			throw error
		}
	}
}
