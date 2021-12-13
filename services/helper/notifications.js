const moment = require("moment-timezone");
const common = require('../../constants/common');

const sessionData = require("../../db/sessions/queries");
const notificationData = require("../../db/notification-template/query");
const userProfile = require("./userProfile");
const sessionAttendesData = require("../../db/sessionAttendees/queries");
const sessionsHelper = require("./sessions");
const ObjectId = require('mongoose').Types.ObjectId;

const kafkaCommunication = require('../../generics/kafka-communication');

module.exports = class Notifications {

    static async sendNotificationBefore1Hour() {

        let currentDateutc = moment().utc().format(common.UTC_DATE_TIME_FORMAT);
        var dateEndTime = moment(currentDateutc).add(61, 'minutes').format(common.UTC_DATE_TIME_FORMAT);
        var dateStartTime = moment(currentDateutc).add(60, 'minutes').format(common.UTC_DATE_TIME_FORMAT);

        let data = await sessionData.findSessions({
            status: "published",
            deleted: false,
            startDateUtc: {
                $gte: dateStartTime,
                $lt: dateEndTime
            }
        });

        let emailTemplate = await notificationData.findOneEmailTemplate(common.MENTOR_SESSION_REMAINDER_EMAIL_CODE);

        if (emailTemplate && data && data.length > 0) {
            data.forEach(async function (session) {

                if (session) {

                    let userData = await userProfile.details("", session.userId);
                    if (userData && userData.data && userData.data.result) {

                        emailTemplate.body = emailTemplate.body.replace("{sessionTitle}", session.title);
                        emailTemplate.body = emailTemplate.body.replace("{name}", userData.data.result.name);

                        const payload = {
                            type: 'email',
                            email: {
                                to: userData.data.result.email,
                                subject: emailTemplate.subject,
                                body: emailTemplate.body
                            }
                        };
                        await kafkaCommunication.pushEmailToKafka(payload);
                    }
                }
            });

        }
    }
    static async sendNotificationBefore15mins() {

        let currentDateutc = moment().utc().format(common.UTC_DATE_TIME_FORMAT);

        var dateEndTime = moment(currentDateutc).add(16, 'minutes').format(common.UTC_DATE_TIME_FORMAT);
        var dateStartTime = moment(currentDateutc).add(15, 'minutes').format(common.UTC_DATE_TIME_FORMAT);
      
        let data = await sessionData.findSessions({
            status: "published",
            deleted: false,
            startDateUtc: {
                $gte: dateStartTime,
                $lt: dateEndTime
            }
        });

        let emailTemplate = await notificationData.findOneEmailTemplate(common.MENTEE_SESSION_REMAINDER_EMAIL_CODE);

        if (emailTemplate && data && data.length > 0) {
            data.forEach(async function (session) {
             
                if (session && session.startDateUtc) {

                    const sessionAttendees = await sessionAttendesData.findAllSessionAttendees({
                        sessionId: ObjectId(session._id)
                    });
                    const sessionAttendeesIds = [];
                    sessionAttendees.forEach(attendee => {
                        sessionAttendeesIds.push(attendee.userId.toString());
                    });
                    const attendeesAccounts = await sessionsHelper.getAllAccountsDetail(sessionAttendeesIds);
                    sessionAttendees.map(attendee => {
                        for (let index = 0; index < attendeesAccounts.result.length; index++) {
                            const element = attendeesAccounts.result[index];
                            if (element._id == attendee.userId) {
                                attendee.attendeeEmail = element.email.address;
                                attendee.attendeeName = element.name;
                                break;
                            }
                        }
                    });

                    if (sessionAttendees && sessionAttendees.length > 0) {

                        sessionAttendees.forEach(async function (attendeeData) {
                            if (attendeeData && attendeeData.attendeeEmail) {

                                emailTemplate.body = emailTemplate.body.replace("{sessionTitle}", session.title);
                                emailTemplate.body = emailTemplate.body.replace("{name}", attendeeData.attendeeName);

                                const payload = {
                                    type: 'email',
                                    email: {
                                        to: attendeeData.attendeeEmail,
                                        subject: emailTemplate.subject,
                                        body: emailTemplate.body
                                    }
                                };
                                await kafkaCommunication.pushEmailToKafka(payload);
                            }

                        });
                    }
                }
            });

        }
    }
}