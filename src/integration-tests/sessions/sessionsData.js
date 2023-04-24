const sessionData = require('@db/sessions/queries')
const { faker } = require('@faker-js/faker')
const sessionAttendesData = require('@db/sessionAttendees/queries')
const moment = require('moment-timezone')
const common = require('@constants/common')

let bodyData

const insertSession = async (now, sessionStatus, meetingInfo) => {
	try {
		let startDate
		let endDate
		if (now) {
			;[startDate, endDate] = [Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000) + 4200]
		} else {
			startDate = faker.datatype.number({
				min: 1585048659,
				max: 3794037459,
			})
			endDate = Number(startDate) + 2000
		}
		bodyData = {
			title: faker.random.alpha(5),
			description: faker.lorem.sentence(),
			startDate: startDate,
			endDate: endDate,
			recommendedFor: [
				{
					value: 'deo',
					label: 'District education officer',
				},
			],
			categories: [
				{
					value: 'Educational Leadership',
					label: 'Educational Leadership',
				},
			],
			medium: [
				{
					label: 'English',
					value: '1',
				},
			],
			timeZone: 'Asia/Calcutta',
			image: ['users/1232s2133sdd1-12e2dasd3123.png'],
			menteePassword: 'test',
			mentorPassword: 'test',
			userId: userId,
			status: sessionStatus || 'published',
			startDateUtc: moment.unix(startDate).utc().format(common.UTC_DATE_TIME_FORMAT),
			endDateUtc: moment.unix(endDate).utc().format(common.UTC_DATE_TIME_FORMAT),
		}
		if (meetingInfo) {
			bodyData.meetingInfo = {
				platform: 'BBB',
				meta: {
					meetingId: 'c321be68f93837188a2e8a8cb679d217a24c18b7-1657692090254',
				},
			}
		}
		let session = await sessionData.createSession(bodyData)
		return session._id.valueOf()
	} catch (error) {
		console.error(error)
	}
}
const insertSessionAttendee = async (sessionId) => {
	try {
		let test = await sessionAttendesData.create({
			userId: userId,
			sessionId: sessionId,
			timeZone: 'Asia/Calcutta',
		})
		const sessionAttendee = await sessionAttendesData.findAttendeeBySessionAndUserId(userId, sessionId)
		return sessionAttendee.sessionId.valueOf()
	} catch (error) {
		console.error(error)
	}
}
module.exports = {
	insertSession,
	insertSessionAttendee,
}
