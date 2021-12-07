const ObjectId = require('mongoose').Types.ObjectId;

const { AwsFileHelper, GcpFileHelper, AzureFileHelper } = require('files-cloud-storage');

const sessionAttendees = require("../../db/sessionAttendees/queries");
const userProfile = require("./userProfile");
const sessionData = require("../../db/sessions/queries");
const common = require('../../constants/common');
const apiResponses = require("../../constants/api-responses");
const httpStatusCode = require("../../generics/http-status");
const bigBlueButton = require("./bigBlueButton");

const feedbackHelper = require("./feedback")
const utils = require('../../generics/utils');

module.exports = class MenteesHelper {

    static async sessions(userId, enrolledSessions, page, limit, search = '') {
        try {
            let sessions = [];
            let filters;

            if (!enrolledSessions) {
                /** Upcoming unenrolled sessions {All sessions}*/
                filters = {
                    status: { $in: ['published', 'live'] },
                    startDateUtc: {
                        $gte: new Date().toISOString()
                    },
                    userId: {
                        $ne: userId
                    }
                };

                sessions = await sessionData.findAllSessions(page, limit, search, filters);
                console.log(sessions);

                if (sessions[0].data.length > 0) {

                    await Promise.all(sessions[0].data.map(async session => {
                        let attendee = await sessionAttendees.findOneSessionAttendee(session._id, userId);

                        session.isEnrolled = false;
                        if (attendee) {
                            session.isEnrolled = true;
                        }

                        session.image = session.image.map(async imgPath => {
                            return utils.getDownloadableUrl(imgPath);
                        });
                        session.image = await Promise.all(session.image);
                    }));
                }

            } else {
                /** Upcoming user's enrolled sessions {My sessions}*/
                /* Fetch sessions if it is not expired or if expired then either status is live or if mentor 
                delays in starting session then status will remain published for that particular interval so fetch that also */

                /* TODO: Need to write cron job that will change the status of expired sessions from published to cancelled if not hosted by mentor */

                filters = {
                    $or: [
                        {
                            'sessionDetail.startDate': {
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
                sessions = await sessionAttendees.findAllUpcomingMenteesSession(page, limit, search, filters);
                sessions[0].data = sessions[0].data.map(async session => {
                    session.image = session.image.map(async imgPath => {
                        return utils.getDownloadableUrl(imgPath);
                    });
                    session.image = await Promise.all(session.image);
                    return session;
                });
                sessions[0].data = await Promise.all(sessions[0].data);
            }

            return common.successResponse({ statusCode: httpStatusCode.ok, message: apiResponses.SESSION_FETCHED_SUCCESSFULLY, result: sessions });
        } catch (error) {
            throw error;
        }
    }

    static async reports(userId, filterType) {
        let filterStartDate;
        let filterEndDate;
        let totalSessionEnrolled;
        let totalsessionsAttended;
        let filters;
        try {
            if (filterType === 'MONTHLY') {
                [filterStartDate, filterEndDate] = utils.getCurrentMonthRange();
            } else if (filterType === 'WEEKLY') {
                [filterStartDate, filterEndDate] = utils.getCurrentWeekRange();
            } else if (filterType === 'QUARTERLY') {
                [filterStartDate, filterEndDate] = utils.getCurrentQuarterRange();
            }

            /* totalSessionEnrolled */
            filters = {
                createdAt: {
                    $gte: filterStartDate.toISOString(),
                    $lte: filterEndDate.toISOString()
                },
                userId: ObjectId(userId),
                deleted: false
            };

            totalSessionEnrolled = await sessionAttendees.countSessionAttendees(filters);

            /* totalSessionAttended */
            filters = {
                'sessionDetail.startDate': {
                    $gte: filterStartDate.toISOString(),
                    $lte: filterEndDate.toISOString()
                },
                userId: ObjectId(userId),
                deleted: false,
                isSessionAttended: true
            };

            totalsessionsAttended = await sessionAttendees.countSessionAttendeesThroughStartDate(filters);
            return common.successResponse({ statusCode: httpStatusCode.ok, message: apiResponses.MENTEES_REPORT_FETCHED_SUCCESSFULLY, result: { totalSessionEnrolled, totalsessionsAttended } });

        } catch (error) {
            throw error;
        }
    }

    static async homeFeed(userId, isAMentor) {
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

            const feedbackData = await feedbackHelper.pending(userId, isAMentor)

            return common.successResponse({
                statusCode: httpStatusCode.ok,
                message: apiResponses.SESSION_FETCHED_SUCCESSFULLY,
                result: result,
                meta: {
                    type: "feedback",
                    data: feedbackData.result
                }
            });
        } catch (error) {
            throw error;
        }
    }

    static joinSession(sessionId, token) {
        return new Promise(async (resolve, reject) => {
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

                if (session.status !== "live") {
                    return common.failureResponse({
                        message: apiResponses.JOIN_ONLY_LIVE_SESSION,
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
                    }, {
                        link: attendeeLink,
                        joinedAt: new Date(),
                        isSessionAttended: true
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
            } catch (error) {
                return reject(error);
            }
        })
    }
}