const sessions = require("./sessions");
const sessionAttendees = require("../../db/sessionAttendees/queries");
const userProfile = require("./userProfile");
const sessionData = require("../../db/sessions/queries");
const common = require('../../constants/common');
const apiResponses = require("../../constants/api-responses");
const httpStatusCode = require("../../generics/http-status");
const bigBlueButton = require("./bigBlueButton");
module.exports = class MenteesHelper {
    
    static sessions(upComingSessions) {
        return new Promise(async (resolve,reject) => {
            try {

                if (upComingSessions) {
                    /** Upcoming sessions */
                } else {
                    /** Enrolled sessions */
                }

                /**
                 * Your business logic here
                 */

            } catch(error) {
                return reject(error);
            }
        })
    }

    static reports(userId) {
        return new Promise(async (resolve,reject) => {
            try {

                /**
                 * Your business logic here
                 */

            } catch(error) {
                return reject(error);
            }
        })
    }

    static homefeed(userId) {
        return new Promise(async (resolve,reject) => {
            try {
                let page = 1;
                let limit = 4;
                let allSessions = await sessions.publishedSessions(page,limit);
                
                let mySessions = await this.getMySessions(userId);

            } catch(error) {
                return reject(error);
            }
        })
    }

    static joinSession(sessionId,token) {
        return new Promise(async (resolve,reject) => {
            try {
                const mentee = await userProfile.details(token);

                if (mentee.data.responseCode !== "OK") {
                    return common.failureResponse({
                        message: apiResponses.USER_NOT_FOUND,
                        statusCode: httpStatusCode.bad_request,
                        responseCode: 'CLIENT_ERROR'
                    }); 
                }

                const session = await sessionData.findSessionById(sessionId);

                if (!session) {
                    return common.failureResponse({
                        message: apiResponses.SESSION_NOT_FOUND,
                        statusCode: httpStatusCode.bad_request,
                        responseCode: 'CLIENT_ERROR'
                    });
                }

                if (session.status !== "started") {
                    return common.failureResponse({
                        message: apiResponses.JOIN_ONLY_STARTED_SESSION,
                        statusCode: httpStatusCode.bad_request,
                        responseCode: 'CLIENT_ERROR'
                    });
                }

                let menteeDetails = mentee.data.result;

                const sessionAttendee = 
                await sessionAttendees.findLinkBySessionAndUserId(
                    menteeDetails._id,
                    sessionId
                );

                if (!sessionAttendee) {
                    return resolve(common.failureResponse({
                        message: apiResponses.USER_NOT_ENROLLED,
                        statusCode: httpStatusCode.bad_request,
                        responseCode: 'CLIENT_ERROR'
                    }));
                }

                let link = "";
                if (sessionAttendee.link) {
                    link = sessionAttendee.link;
                } else {
                    const attendeeLink = await bigBlueButton.joinMeetingAsAttendee(
                        sessionId,
                        menteeDetails.name,
                        session.menteePassword
                    );

                    await sessionAttendees.updateOne({
                        _id: sessionAttendee
                    },{
                        link: attendeeLink,
                        joinedAt: new Date()
                    })

                    link = attendeeLink;
                }

                return resolve(common.successResponse({
                    statusCode: httpStatusCode.ok,
                    message: apiResponses.SESSION_START_LINK,
                    result: {
                        link: link
                    }
                }));
            } catch(error) {
                return reject(error);
            }
        })
    }
}