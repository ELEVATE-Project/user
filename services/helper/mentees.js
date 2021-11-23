const ObjectId = require('mongoose').Types.ObjectId;

const sessions = require('./sessions');
const sessionData = require('../../db/sessions/queries');
const sessionAttendeesData = require('../../db/sessionAttendees/queries');

const utilsHelper = require("../../generics/utils");
const httpStatusCode = require("../../generics/http-status");
const apiResponses = require("../../constants/api-responses");
const common = require('../../constants/common');
const SessionsAttendeesData = require('../../db/sessionAttendees/queries');

module.exports = class MenteesHelper {

    static async sessions(userId, enrolledSessions, page, limit, search = '') {
        try {
            let sessions = [];
            let filters;

            if (!enrolledSessions) {
                /** Upcoming unenrolled sessions */
                filters = {
                    status: 'published',
                    startDateTime: {
                        $gte: new Date().toISOString()
                    },
                    userId: {
                        $ne: userId
                    }
                };
                sessions = await sessionData.findAllSessions(page, limit, search, filters);
            } else {
                /** Upcoming user's enrolled sessions */
                /* Fetch sessions if it is not expired or if expired then either status is live or if mentor 
                delays in starting session then status will remain published for that particular interval so fetch that also */

                /* TODO: Need to write cron job that will change the status of expired sessions from published to cancelled if not hosted by mentor */

                filters = {
                    $or: [
                        {
                            'sessionDetail.startDateTime': {
                                $gte: new Date().toISOString()
                            }
                        },
                        {
                            'sessionDetail.status': 'published'
                        },
                        {
                            'sessionDetail.status': 'live'
                        }
                    ],
                    userId: ObjectId(userId)
                };
                sessions = await SessionsAttendeesData.findAllUpcomingMenteesSession(page, limit, search, filters);
            }
            
            return common.successResponse({statusCode: httpStatusCode.ok, message: apiResponses.SESSION_FETCHED_SUCCESSFULLY, result: sessions});
        } catch (error) {
            throw error;
        }
    }

    static async reports(userId) {
        try {

            /**
             * Your business logic here
             */

        } catch (error) {
            throw error;
        }
    }

    static async homeFeed(userId) {
        try {
            /* All Sessions */
            const page = 1;
            let limit = 4;
            let allSessions = await this.sessions(userId, false, page, limit);

            /* My Sessions */
            limit = 2;
            let mySessions = await this.sessions(userId, true, page, limit);

            const result = {
                allSessions: allSessions.result[0].data,
                mySessions: mySessions.result[0].data,
            }
            return common.successResponse({statusCode: httpStatusCode.ok, message: apiResponses.SESSION_FETCHED_SUCCESSFULLY, result: result});
        } catch (error) {
            throw error;
        }
    }
}