const moment = require("moment-timezone");
const common = require('../../constants/common');

const sessionData = require("../../db/sessions/queries");
const notificationData = require("../../db/notification-template/query");
const userProfile = require("./userProfile");

const kafkaCommunication = require('../../generics/kafka-communication');

module.exports = class SessionsHelper {

    static async sendNotificationBefore1Hour() {

        let currentDateutc = moment().utc().format(common.UTC_DATE_TIME_FORMAT);
        var dateEndTime = moment(currentDateutc).add(61, 'minutes').format(common.UTC_DATE_TIME_FORMAT);
        var dateStartTime = moment(currentDateutc).add(60, 'minutes').format(common.UTC_DATE_TIME_FORMAT);


        console.log("currentDate", dateStartTime, "1-------", dateEndTime);

        let data = await sessionData.findSessions({
            status: "published",
            deleted: false,
            startDateUtc: {
                $gte: dateStartTime,
                $lte: dateEndTime
            }
        });

        let emailTemplate = await notificationData.findOneEmailTemplate(common.MENTOR_24HOUR_REMAINDER_EMAIL_CODE);

        if (data && data.length > 0) {
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
                $lte: dateEndTime
            }
        });

        let emailTemplate = await notificationData.findOneEmailTemplate(common.MENTOR_15MINS_REMAINDER_EMAIL_CODE);

        if (data && data.length > 0) {
            data.forEach(async function (session) {

                if (session && session.startDateUtc) {

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
}