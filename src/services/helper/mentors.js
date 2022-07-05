// Dependencies
const sessionsData = require('@db/sessions/queries')
const utils = require('@generics/utils')
const common = require('@constants/common')
const apiResponses = require('@constants/api-responses')
const httpStatusCode = require('@generics/http-status')
const ObjectId = require('mongoose').Types.ObjectId

const apiEndpoints = require('@constants/endpoints')
const apiBaseUrl = process.env.USER_SERIVCE_HOST + process.env.USER_SERIVCE_BASE_URL
const request = require('@generics/requests')

module.exports = class MentorsHelper {
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
