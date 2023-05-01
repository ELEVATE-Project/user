// Dependenices
const moment = require('moment-timezone')
const common = require('@constants/common')
const sessionData = require('@db/sessions/queries')
const notificationData = require('@db/notification-template/query')
const sessionAttendesData = require('@db/sessionAttendees/queries')
const sessionAttendeesHelper = require('./sessionAttendees')
const ObjectId = require('mongoose').Types.ObjectId
const kafkaCommunication = require('@generics/kafka-communication')
const utils = require('@generics/utils')

module.exports = class Notifications {
	/**
	 * Send Notification to Mentors before 24 hour.
	 * @method
	 * @name sendNotificationBefore24Hour
	 * @returns
	 */

	static async sendNotificationBefore24Hour() {
		try {
			let currentDateutc = moment().utc().format(common.UTC_DATE_TIME_FORMAT)
			var dateEndTime = moment(currentDateutc).add(1441, 'minutes').format(common.UTC_DATE_TIME_FORMAT)
			var dateStartTime = moment(currentDateutc).add(1440, 'minutes').format(common.UTC_DATE_TIME_FORMAT)

			let sessions = await sessionData.findSessions({
				status: 'published',
				deleted: false,
				startDateUtc: {
					$gte: dateStartTime,
					$lt: dateEndTime,
				},
			})

			let emailTemplate = await notificationData.findOneEmailTemplate(common.MENTOR_SESSION_REMAINDER_EMAIL_CODE)

			if (emailTemplate && sessions && sessions.length > 0) {
				const mentorIds = []
				sessions.forEach((session) => {
					mentorIds.push(session.userId.toString())
				})
				const userAccounts = await sessionAttendeesHelper.getAllAccountsDetail(mentorIds)
				if (userAccounts && userAccounts.result.length > 0) {
					await Promise.all(
						sessions.map(async function (session) {
							let emailBody = emailTemplate.body
							if (
								process.env.DEFAULT_MEETING_SERVICE.toUpperCase() != 'BBB' &&
								!session.meetingInfo?.link
							) {
								emailBody = utils.extractEmailTemplate(emailBody, ['default', 'linkWarning'])
							} else {
								emailBody = utils.extractEmailTemplate(emailBody, ['default'])
							}
							emailBody = emailBody.replace('{sessionTitle}', session.title)
							var foundElement = userAccounts.result.find((e) => e._id === session.userId.toString())

							if (foundElement && foundElement.email.address && foundElement.name) {
								emailBody = emailBody.replace('{name}', foundElement.name)
								const payload = {
									type: 'email',
									email: {
										to: foundElement.email.address,
										subject: emailTemplate.subject,
										body: emailBody,
									},
								}
								await kafkaCommunication.pushEmailToKafka(payload)
							}
						})
					)
				}
			}
		} catch (error) {
			throw error
		}
	}

	/**
	 * Send Notification to attendees before 15 mins.
	 * @method
	 * @name sendNotificationBefore15mins
	 * @returns
	 */

	static async sendNotificationBefore15mins() {
		try {
			let currentDateutc = moment().utc().format(common.UTC_DATE_TIME_FORMAT)

			var dateEndTime = moment(currentDateutc).add(16, 'minutes').format(common.UTC_DATE_TIME_FORMAT)
			var dateStartTime = moment(currentDateutc).add(15, 'minutes').format(common.UTC_DATE_TIME_FORMAT)

			let data = await sessionData.findSessions({
				status: 'published',
				deleted: false,
				startDateUtc: {
					$gte: dateStartTime,
					$lt: dateEndTime,
				},
			})

			let allAttendess = []
			let attendeesInfo = []

			let emailTemplate = await notificationData.findOneEmailTemplate(common.MENTEE_SESSION_REMAINDER_EMAIL_CODE)

			if (emailTemplate && data && data.length > 0) {
				await Promise.all(
					data.map(async function (session) {
						const sessionAttendees = await sessionAttendesData.findAllSessionAttendees({
							sessionId: ObjectId(session._id),
						})
						if (sessionAttendees && sessionAttendees.length > 0) {
							sessionAttendees.forEach((attendee) => {
								allAttendess.push(attendee.userId.toString())
								attendeesInfo.push({
									userId: attendee.userId.toString(),
									title: session.title,
								})
							})
						}
					})
				)
			}
			const attendeesAccounts = await sessionAttendeesHelper.getAllAccountsDetail(allAttendess)

			if (attendeesAccounts.result && attendeesAccounts.result.length > 0) {
				attendeesInfo.forEach(async function (attendee) {
					let emailBody = emailTemplate.body.replace('{sessionTitle}', attendee.title)
					var foundElement = attendeesAccounts.result.find((e) => e._id === attendee.userId.toString())
					if (foundElement && foundElement.email.address && foundElement.name) {
						emailBody = emailBody.replace('{name}', foundElement.name)
						const payload = {
							type: 'email',
							email: {
								to: foundElement.email.address,
								subject: emailTemplate.subject,
								body: emailBody,
							},
						}
						await kafkaCommunication.pushEmailToKafka(payload)
					}
				})
			}
		} catch (error) {
			throw error
		}
	}

	/**
	 * Send Notification to Mentors before 1 hour.
	 * @method
	 * @name sendNotificationBefore1Hour
	 * @returns
	 */

	static async sendNotificationBefore1Hour() {
		try {
			let currentDateutc = moment().utc().format(common.UTC_DATE_TIME_FORMAT)
			var dateEndTime = moment(currentDateutc).add(61, 'minutes').format(common.UTC_DATE_TIME_FORMAT)
			var dateStartTime = moment(currentDateutc).add(60, 'minutes').format(common.UTC_DATE_TIME_FORMAT)

			let sessions = await sessionData.findSessions({
				status: 'published',
				deleted: false,
				startDateUtc: {
					$gte: dateStartTime,
					$lt: dateEndTime,
				},
			})

			let emailTemplate = await notificationData.findOneEmailTemplate(
				common.MENTOR_SESSION_ONE_HOUR_REMAINDER_EMAIL_CODE
			)

			if (emailTemplate && sessions && sessions.length > 0) {
				const mentorIds = []
				sessions.forEach((session) => {
					mentorIds.push(session.userId.toString())
				})
				const userAccounts = await sessionAttendeesHelper.getAllAccountsDetail(mentorIds)
				if (userAccounts && userAccounts.result.length > 0) {
					await Promise.all(
						sessions.map(async function (session) {
							let emailBody = emailTemplate.body
							if (
								process.env.DEFAULT_MEETING_SERVICE.toUpperCase() != 'BBB' &&
								!session.meetingInfo?.link
							) {
								emailBody = utils.extractEmailTemplate(emailBody, ['default', 'linkWarning'])
							} else {
								emailBody = utils.extractEmailTemplate(emailBody, ['default'])
							}
							emailBody = emailBody.replace('{sessionTitle}', session.title)
							var foundElement = userAccounts.result.find((e) => e._id === session.userId.toString())

							if (foundElement && foundElement.email.address && foundElement.name) {
								emailBody = emailBody.replace('{name}', foundElement.name)
								const payload = {
									type: 'email',
									email: {
										to: foundElement.email.address,
										subject: emailTemplate.subject,
										body: emailBody,
									},
								}
								await kafkaCommunication.pushEmailToKafka(payload)
							}
						})
					)
				}
			}
		} catch (error) {
			throw error
		}
	}
}
