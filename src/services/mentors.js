// Dependencies
const utils = require('@generics/utils')
const userRequests = require('@requests/user')
const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')
const mentorQueries = require('@database/queries/mentorExtension')
const { UniqueConstraintError } = require('sequelize')
const _ = require('lodash')
const sessionAttendeesQueries = require('@database/queries/sessionAttendees')
const sessionQueries = require('@database/queries/sessions')
const entityTypeQueries = require('@database/queries/entityType')

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
			const mentorsDetails = await mentorQueries.getMentorExtension(id)
			if (!mentorsDetails) {
				return common.failureResponse({
					statusCode: httpStatusCode.bad_request,
					message: 'MENTORS_NOT_FOUND',
					responseCode: 'CLIENT_ERROR',
				})
			}

			let upcomingSessions = await sessionQueries.getMentorsUpcomingSessions(page, limit, search, id)

			if (!upcomingSessions.data.length) {
				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'UPCOMING_SESSION_FETCHED',
					result: {
						data: [],
						count: 0,
					},
				})
			}

			upcomingSessions.data = await this.sessionMentorDetails(upcomingSessions.data)

			if (menteeUserId && id != menteeUserId) {
				upcomingSessions.data = await this.menteeSessionDetails(upcomingSessions.data, menteeUserId)
			}
			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'UPCOMING_SESSION_FETCHED',
				result: upcomingSessions,
			})
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
	/* 	static async profile(id) {
		try {
			const mentorsDetails = await userRequests.details('', id)
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
	} */

	/**
	 * Mentors reports.
	 * @method
	 * @name reports
	 * @param {String} userId - user id.
	 * @param {String} filterType - MONTHLY/WEEKLY/QUARTERLY.
	 * @returns {JSON} - Mentors reports
	 */

	static async reports(userId, filterType, roles) {
		try {
			if (!utils.isAMentor(roles)) {
				return common.failureResponse({
					statusCode: httpStatusCode.bad_request,
					message: 'MENTORS_NOT_FOUND',
					responseCode: 'CLIENT_ERROR',
				})
			}

			let filterStartDate, filterEndDate

			switch (filterType) {
				case 'MONTHLY':
					;[filterStartDate, filterEndDate] = utils.getCurrentMonthRange()
					break
				case 'WEEKLY':
					;[filterStartDate, filterEndDate] = utils.getCurrentWeekRange()
					break
				case 'QUARTERLY':
					;[filterStartDate, filterEndDate] = utils.getCurrentQuarterRange()
					break
				default:
					throw new Error('Invalid filterType')
			}

			const totalSessionsCreated = await sessionQueries.getCreatedSessionsCountInDateRange(
				userId,
				filterStartDate.toISOString(),
				filterEndDate.toISOString()
			)

			const totalSessionsHosted = await sessionQueries.getHostedSessionsCountInDateRange(
				userId,
				Date.parse(filterStartDate) / 1000, // Converts milliseconds to seconds
				Date.parse(filterEndDate) / 1000
			)

			const result = { total_session_created: totalSessionsCreated, total_session_hosted: totalSessionsHosted }
			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'MENTORS_REPORT_FETCHED_SUCCESSFULLY',
				result,
			})
		} catch (error) {
			console.log(error)
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
	static async share(id) {
		try {
			const shareLink = await userRequests.share(id)
			return shareLink
		} catch (error) {
			return error
		}
	}

	static async sessionMentorDetails(session) {
		try {
			if (session.length > 0) {
				const userIds = _.uniqBy(session, 'mentor_id').map((item) => item.mentor_id)

				let mentorDetails = await userRequests.getListOfUserDetails(userIds)
				mentorDetails = mentorDetails.result

				for (let i = 0; i < session.length; i++) {
					let mentorIndex = mentorDetails.findIndex((x) => x.id === session[i].mentor_id)
					session[i].mentor_name = mentorDetails[mentorIndex].name
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
			console.log(error)
			throw error
		}
	}

	static async menteeSessionDetails(sessions, userId) {
		try {
			if (sessions.length > 0) {
				const sessionIds = sessions.map((session) => session.id)

				const attendees = await sessionAttendeesQueries.findAll({
					session_id: sessionIds,
					mentee_id: userId,
				})

				await Promise.all(
					sessions.map(async (session) => {
						const attendee = attendees.find((attendee) => attendee.session_id === session.id)
						session.is_enrolled = !!attendee
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
	static async createMentorExtension(data, userId, orgId) {
		try {
			data.user_id = userId
			let validationData = await entityTypeQueries.findUserEntityTypesAndEntities(
				{
					status: 'ACTIVE',
				},
				orgId
			)

			validationData = utils.removeParentEntityTypes(JSON.parse(JSON.stringify(validationData)))

			let res = utils.validateInput(data, validationData, 'mentor_extensions')
			if (!res.success) {
				return common.failureResponse({
					message: 'SESSION_CREATION_FAILED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
					result: res.errors,
				})
			}
			let mentorExtensionsModel = await mentorQueries.getColumns()
			data = utils.restructureBody(data, validationData, mentorExtensionsModel)

			const response = await mentorQueries.createMentorExtension(data)

			const processDbResponse = utils.processDbResponse(response.toJSON(), validationData)

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'MENTOR_EXTENSION_CREATED',
				result: processDbResponse,
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
	static async updateMentorExtension(data, userId, orgId) {
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
			let validationData = await entityTypeQueries.findUserEntityTypesAndEntities(
				{
					status: 'ACTIVE',
				},
				orgId
			)

			validationData = utils.removeParentEntityTypes(JSON.parse(JSON.stringify(validationData)))

			let mentorExtensionsModel = await mentorQueries.getColumns()

			data = utils.restructureBody(updatedMentor[0], validationData, mentorExtensionsModel)

			const processDbResponse = utils.processDbResponse(data, validationData)
			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'MENTOR_EXTENSION_UPDATED',
				result: processDbResponse,
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

	/**
	 * Profile.
	 * @method
	 * @name profile
	 * @param {String} userId - user id.
	 * @returns {JSON} - profile details
	 */
	static async read(id, orgId) {
		try {
			let mentorProfile = await userProfile.details('', id)
			if (!mentorProfile.data.result) {
				return common.failureResponse({
					statusCode: httpStatusCode.not_found,
					message: 'MENTORS_NOT_FOUND',
				})
			}
			if (!orgId) {
				orgId = mentorProfile.data.result.organization_id
			}

			let mentorExtension = await mentorQueries.getMentorExtension(id)

			if (!mentorProfile.data.result || !mentorExtension) {
				return common.failureResponse({
					statusCode: httpStatusCode.not_found,
					message: 'MENTORS_NOT_FOUND',
				})
			}
			mentorProfile = utils.deleteProperties(mentorProfile.data.result, ['created_at', 'updated_at'])

			mentorExtension = utils.deleteProperties(mentorExtension, ['user_id', 'organisation_ids'])
			let validationData = await entityTypeQueries.findUserEntityTypesAndEntities(
				{
					status: 'ACTIVE',
				},
				orgId
			)

			validationData = utils.removeParentEntityTypes(JSON.parse(JSON.stringify(validationData)))

			const processDbResponse = utils.processDbResponse(mentorExtension, validationData)
			const totalSessionHosted = await sessionQueries.countHostedSessions(id)

			const totalSession = await sessionAttendeesQueries.countEnrolledSessions(id)

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'PROFILE_FTECHED_SUCCESSFULLY',
				result: {
					sessions_attended: totalSession,
					sessions_hosted: totalSessionHosted,
					...mentorProfile,
					...processDbResponse,
				},
			})
		} catch (error) {
			console.error(error)
			return error
		}
	}
}
