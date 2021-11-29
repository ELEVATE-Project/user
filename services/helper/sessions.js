const ObjectId = require('mongoose').Types.ObjectId;
const bcyptJs = require('bcryptjs');
const httpStatusCode = require("../../generics/http-status");
const apiResponses = require("../../constants/api-responses");
const apiEndpoints = require("../../constants/endpoints");
const common = require('../../constants/common');

const sessionData = require("../../db/sessions/queries");
const sessionAttendesData = require("../../db/sessionAttendees/queries");

const apiBaseUrl =
    process.env.USER_SERIVCE_HOST +
    process.env.USER_SERIVCE_BASE_URL;
const request = require('request');

const bigBlueButton = require("./bigBlueButton");
const userProfile = require("./userProfile");
const utils = require('../../generics/utils');

module.exports = class SessionsHelper {

    static async create(bodyData, loggedInUserId) {
        bodyData.userId = ObjectId(loggedInUserId);
        try {
            if (!await this.verifyMentor(loggedInUserId)) {
                return common.failureResponse({
                    message: apiResponses.INVALID_PERMISSION,
                    statusCode: httpStatusCode.bad_request,
                    responseCode: 'CLIENT_ERROR'
                });
            }

            let data = await sessionData.createSession(bodyData);

            await this.setMentorPassword(data._id,data.userId);
            await this.setMenteePassword(data._id,data.createdAt);

            return common.successResponse({
                statusCode: httpStatusCode.created,
                message: apiResponses.SESSION_CREATED_SUCCESSFULLY,
                result: data
            });

        } catch (error) {
            throw error;
        }
    }

    static async update(sessionId, bodyData, userId,method) {
        try {

            if (!await this.verifyMentor(userId)) {
                return common.failureResponse({
                    message: apiResponses.INVALID_PERMISSION,
                    statusCode: httpStatusCode.bad_request,
                    responseCode: 'CLIENT_ERROR'
                });
            }

            let message;
            let updateData;
            if(method==common.DELETE_METHOD){
                updateData = { deleted:true };
                message = apiResponses.SESSION_DELETED_SUCCESSFULLY;

            } else {
                
                updateData = bodyData;
                message = apiResponses.SESSION_UPDATED_SUCCESSFULLY;
            }
               
            updateData.updatedAt = new Date().getTime();
            const result = await sessionData.updateOneSession({
                _id: ObjectId(sessionId)
            }, updateData);
            
            if (result === 'SESSION_ALREADY_UPDATED') {
                return common.failureResponse({
                    message: apiResponses.SESSION_ALREADY_UPDATED,
                    statusCode: httpStatusCode.bad_request,
                    responseCode: 'CLIENT_ERROR'
                });
            } else if (result === 'SESSION_NOT_FOUND') {
                return common.failureResponse({
                    message: apiResponses.SESSION_NOT_FOUND,
                    statusCode: httpStatusCode.bad_request,
                    responseCode: 'CLIENT_ERROR'
                });
            }
            return common.successResponse({
                statusCode: httpStatusCode.accepted,
                message: message
            });

        } catch (error) {
            throw error;    
        }

    }

    static async details(id) {
        try {
            const filter = {};

            if (ObjectId.isValid(id)) {
                filter._id = id;
            } else {
                filter.shareLink = id;
            }

            const sessionDetails = await sessionData.findOneSession(filter, { shareLink: 0 });
            if (!sessionDetails) {
                return common.failureResponse({
                    message: apiResponses.SESSION_NOT_FOUND,
                    statusCode: httpStatusCode.bad_request,
                    responseCode: 'CLIENT_ERROR'
                });
            }
            return common.successResponse({
                statusCode: httpStatusCode.created,
                message: apiResponses.SESSION_FETCHED_SUCCESSFULLY,
                result: sessionDetails
            });

        } catch (error) {
            throw error;
        }
    }

    static async list(loggedInUserId, page, limit, search, status) {
        try {

            let arrayOfStatus = [];
            if (status && status != "") {
                arrayOfStatus = status.split(",");
            }

            let filters = {
                userId: loggedInUserId
            };
            if (arrayOfStatus.length > 0) {
                filters['status'] = {
                    $in: arrayOfStatus
                }
            }
            const sessionDetails = await sessionData.findAllSessions(page, limit, search, filters);
            if (sessionDetails[0] && sessionDetails[0].data.length == 0) {
                return common.failureResponse({
                    message: apiResponses.SESSION_NOT_FOUND,
                    statusCode: httpStatusCode.bad_request,
                    responseCode: 'CLIENT_ERROR',
                    result:[]
                });
            }
            return common.successResponse({
                statusCode: httpStatusCode.ok,
                message: apiResponses.SESSION_FETCHED_SUCCESSFULLY,
                result: sessionDetails[0] ? sessionDetails[0] : []
            });

        } catch (error) {
            throw error;
        }
    }

    static async enroll(sessionId, userId) {
        try {
            const session = await sessionData.findSessionById(sessionId);
            if (!session) {
                return common.failureResponse({
                    message: apiResponses.SESSION_NOT_FOUND,
                    statusCode: httpStatusCode.bad_request,
                    responseCode: 'CLIENT_ERROR'
                });
            }

            const sessionAttendeeExist = await sessionAttendesData.findOneSessionAttendee(sessionId, userId);
            if (sessionAttendeeExist) {
                return common.failureResponse({
                    message: apiResponses.USER_ALREADY_ENROLLED,
                    statusCode: httpStatusCode.bad_request,
                    responseCode: 'CLIENT_ERROR'
                });
            }

            const attendee = {
                userId,
                sessionId
            };

            await sessionAttendesData.create(attendee);

            return common.successResponse({
                statusCode: httpStatusCode.created,
                message: apiResponses.USER_ENROLLED_SUCCESSFULLY,
            });
        } catch (error) {
            throw error;
        }
    }

    static async unEnroll(sessionId, userId) {
        try {
            const session = await sessionData.findSessionById(sessionId);
            if (!session) {
                return common.failureResponse({
                    message: apiResponses.SESSION_NOT_FOUND,
                    statusCode: httpStatusCode.bad_request,
                    responseCode: 'CLIENT_ERROR'
                });
            }
            const response = await sessionAttendesData.unEnrollFromSession(sessionId, userId);

            if (response === 'USER_NOT_ENROLLED') {
                return common.failureResponse({
                    message: apiResponses.USER_NOT_ENROLLED,
                    statusCode: httpStatusCode.bad_request,
                    responseCode: 'CLIENT_ERROR'
                });
            }

            return common.successResponse({
                statusCode: httpStatusCode.accepted,
                message: apiResponses.USER_UNENROLLED_SUCCESSFULLY,
            });
        } catch (error) {
            throw error;
        }
    }

    static async verifyMentor(id) {
        return new Promise(async (resolve, reject) => {
            try {
                let options = {
                    "headers": {
                        'Content-Type': "application/json",
                        "internal_access_token": process.env.INTERNAL_ACCESS_TOKEN
                    }
                };

                let apiUrl = apiBaseUrl + apiEndpoints.VERIFY_MENTOR + "?userId=" + id;
                try {
                    request.post(apiUrl, options, callback);

                    function callback(err, data) {
                        if (err) {
                            return reject({
                                message: apiResponses.USER_SERVICE_DOWN
                            });
                        } else {
                            data.body = JSON.parse(data.body);
                            if (data.body.result && data.body.result.isAMentor) {
                                return resolve(true);
                            } else {
                                return resolve(false);

                            }
                        }
                    }
                } catch (error) {
                    reject(error);
                }

            } catch (error) {
                reject(error);
            }
        });
    }

    static async share(sessionId) {
        try {
            const session = await sessionData.findSessionById(sessionId);
            if (!session) {
                return common.failureResponse({
                    message: apiResponses.SESSION_NOT_FOUND,
                    statusCode: httpStatusCode.bad_request,
                    responseCode: 'CLIENT_ERROR'
                });
            }
            let shareLink = session.shareLink;
            if (!shareLink) {
                shareLink = bcyptJs.hashSync(sessionId, bcyptJs.genSaltSync(10));
                shareLink = shareLink.replace('/','');
                await sessionData.updateOneSession({ _id: ObjectId(sessionId) }, { shareLink });
            }
            return common.successResponse({ message: apiResponses.SESSION_LINK_GENERATED_SUCCESSFULLY, statusCode: httpStatusCode.ok, result: { shareLink } });
        } catch (error) {
            throw error;
        }
    }

    static upcomingPublishedSessions(page, limit, search) {
        return new Promise(async (resolve, reject) => {
            try {
                const publishedSessions = await sessionData.searchAndPagination(page, limit, search);
                resolve(publishedSessions);
            } catch (error) {
                reject(error);
            }
        })
    }

    static start(sessionId,token) {
        return new Promise(async (resolve, reject) => {
            try {
                const mentor = await userProfile.details(token);

                if (mentor.data.responseCode !== "OK") {
                    return common.failureResponse({
                        message: apiResponses.MENTORS_NOT_FOUND,
                        statusCode: httpStatusCode.bad_request,
                        responseCode: 'CLIENT_ERROR'
                    }); 
                }

                const mentorDetails = mentor.data.result;

                if (!mentorDetails.isAMentor) {
                    return common.failureResponse({
                        message: apiResponses.NOT_A_MENTOR,
                        statusCode: httpStatusCode.bad_request,
                        responseCode: 'CLIENT_ERROR'
                    }); 
                }

                const session = await sessionData.findSessionById(sessionId);

                if (!session) {
                    return resolve(common.failureResponse({
                        message: apiResponses.SESSION_NOT_FOUND,
                        statusCode: httpStatusCode.bad_request,
                        responseCode: 'CLIENT_ERROR'
                    }));
                }

                if (session.userId !== mentor.data.result._id) {
                    return resolve(common.failureResponse({
                        message: apiResponses.CANNOT_START_OTHER_MENTOR_SESSION,
                        statusCode: httpStatusCode.bad_request,
                        responseCode: 'CLIENT_ERROR'
                    }));
                }

                let link = "";
                if (session.link) {
                    link = session.link;
                } else {
                    const meetingDetails = await bigBlueButton.createMeeting(
                        session._id,
                        session.title,
                        session.menteePassword,
                        session.mentorPassword
                    );
    
                    if (!meetingDetails) {
                        return resolve(common.failureResponse({
                            message: apiResponses.MEETING_NOT_CREATED,
                            statusCode: httpStatusCode.internal_server_error,
                            responseCode: 'SERVER_ERROR'
                        }));
                    }
    
                    const moderatorMeetingLink = await bigBlueButton.joinMeetingAsModerator(
                        session._id,
                        mentorDetails.name,
                        session.mentorPassword
                    );

                    await sessionData.updateOneSession({
                        _id: session._id
                    },{
                        link: moderatorMeetingLink,
                        status: "live",
                        startedAt: new Date()
                    })

                    link = moderatorMeetingLink;
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

    static setMentorPassword(sessionId,userId) {
        return new Promise(async (resolve, reject) => {
            try {

                let hashPassword = utils.hash(sessionId + userId);
                const result = await sessionData.updateOneSession({
                    _id: sessionId
                }, {
                    mentorPassword: hashPassword
                });

                return resolve(result);

            } catch (error) {
                return reject(error);
            }
        })
    }

    static setMenteePassword(sessionId,createdAt) {
        return new Promise(async (resolve, reject) => {
            try {

                let hashPassword = utils.hash(sessionId + createdAt);
                const result = await sessionData.updateOneSession({
                    _id: sessionId
                }, {
                    menteePassword: hashPassword
                });

                return resolve(result);

            } catch (error) {
                return reject(error);
            }
        })
    }

    static completed(sessionId) {
        return new Promise(async (resolve, reject) => {
            try {

                 const recordingInfo = await bigBlueButton.getRecordings(sessionId);
                 console.log("---recordings info ----",recordingInfo.data.recordings);
                
                const result = await sessionData.updateOneSession({
                    _id: sessionId
                }, {
                    status: "completed",
                    recordings: recordingInfo.data.recordings,
                    completedAt: new Date()
                });

                return resolve(result);

            } catch (error) {
                return reject(error);
            }
        })
    }

}
