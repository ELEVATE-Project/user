const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')
const sessionData = require('@db/sessions/queries')
const notificationTemplateData = require('@db/notification-template/query')
const sessionAttendeesData = require('@db/sessionAttendees/queries')
const sessionAttendeesHelper = require('./sessionAttendees')
const utils = require('@generics/utils')
const kafkaCommunication = require('@generics/kafka-communication')

module.exports = class AdminHelper {
	/**
	 * userDelete
	 * @method
	 * @name userDelete
	 * @param {decodedToken} decodedToken - decoded token of admin.
	 * @param {userId} userId - UserId of the user that needs to be deleted
	 * @returns {JSON} - List of users
	 */

	static async userDelete(decodedToken, userId) {
		try {
			if (decodedToken.role !== common.ADMIN_ROLE) {
				return common.failureResponse({
					message: 'UNAUTHORIZED_REQUEST',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}

			let result = {}

			const removedSessionsDetail = await sessionData.removeMentorsUpcomingSessions(userId) // Remove all upcoming sessions by the user if any

			const isAttendeesNotified = await this.unenrollAndNotifySessionAttendees(removedSessionsDetail) //Notify the removed sessions attendees if any
			result.isAttendeesNotified = isAttendeesNotified

			const isUnenrolledFromSessions = await this.unenrollFromUpcomingSessions(userId) //Unenroll the user if enrolled into any upcoming sessions
			result.isUnenrolledFromSessions = isUnenrolledFromSessions

			if (isUnenrolledFromSessions && isAttendeesNotified) {
				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'USER_REMOVED_SUCCESSFULLY',
					result,
				})
			} else {
				return common.failureResponse({
					statusCode: httpStatusCode.ok,
					message: 'USER_NOT_REMOVED_SUCCESSFULLY',
					result,
				})
			}
		} catch (error) {
			console.error('An error occurred in userDelete:', error)
			return error
		}
	}

	static async unenrollAndNotifySessionAttendees(removedSessionsDetail) {
		try {
			const templateData = await notificationTemplateData.findOneEmailTemplate(
				process.env.MENTOR_SESSION_DELETE_EMAIL_TEMPLATE
			)

			for (const session of removedSessionsDetail) {
				const sessionAttendees = await sessionAttendeesData.findAllSessionAttendees({
					sessionId: session._id,
				})

				const sessionAttendeesIds = sessionAttendees.map((attendee) => attendee.userId.toString())

				const attendeesAccounts = await sessionAttendeesHelper.getAllAccountsDetail(sessionAttendeesIds)

				sessionAttendees.forEach((attendee) => {
					for (const element of attendeesAccounts.result) {
						if (element._id == attendee.userId) {
							attendee.attendeeEmail = element.email.address
							attendee.attendeeName = element.name
							break
						}
					}
				})

				const sendEmailPromises = sessionAttendees.map(async (attendee) => {
					const payload = {
						type: 'email',
						email: {
							to: attendee.attendeeEmail,
							subject: templateData.subject,
							body: utils.composeEmailBody(templateData.body, {
								name: attendee.attendeeName,
								sessionTitle: session.title,
							}),
						},
					}
					await kafkaCommunication.pushEmailToKafka(payload)
				})
				await Promise.all(sendEmailPromises)
			}

			const result = await sessionAttendeesData.unEnrollAllAttendeesOfSessions(removedSessionsDetail)
			return result
		} catch (error) {
			console.error('An error occurred in notifySessionAttendees:', error)
			return error
		}
	}

	static async unenrollFromUpcomingSessions(userId) {
		try {
			const upcomingSessions = await sessionData.getAllUpcomingSessions()

			const usersUpcomingSessions = await sessionAttendeesData.usersUpcomingSessions(userId, upcomingSessions)
			await Promise.all(
				usersUpcomingSessions.map(async (session) => {
					await sessionData.updateEnrollmentCount(session.sessionId)
				})
			)

			const unenrollFromUpcomingSessions = await sessionAttendeesData.unenrollFromUpcomingSessions(
				userId,
				upcomingSessions
			)

			return unenrollFromUpcomingSessions
		} catch (error) {
			console.error('An error occurred in unenrollFromUpcomingSessions:', error)
			return error
		}
	}
}
