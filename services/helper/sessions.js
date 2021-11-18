const ObjectId = require('mongoose').Types.ObjectId;

const utilsHelper = require("../../generics/utils");
const httpStatusCode = require("../../generics/http-status");
const apiResponses = require("../../constants/api-responses");
const apiEndpoints = require("../../constants/endpoints");
const common = require('../../constants/common');
const sessionData = require("../../db/sessions/queries");
const apiBaseUrl =
    process.env.USER_SERIVCE_HOST +
    process.env.USER_SERIVCE_BASE_URL;
const request = require('request');

const sessionAttendes = require("../../db/sessionAttendees/queries");

module.exports = class SessionsHelper {

    static form(bodyData) {
        return new Promise(async (resolve, reject) => {
            try {

                /**
                 * Sessions form business logic
                 */

            } catch (error) {
                return reject(error);
            }
        })
    }

    static async create(bodyData, loggedInUserId) {
        bodyData.userId = ObjectId(loggedInUserId);
        try {
            if (!await this.varifyMentor(loggedInUserId)) {
                return common.failureResponse({
                    message: apiResponses.INVALID_PERMISSION,
                    statusCode: httpStatusCode.bad_request,
                    responseCode: 'CLIENT_ERROR'
                });
            }

            let data = await sessionData.createSession(bodyData);
            return common.successResponse({
                statusCode: httpStatusCode.created,
                message: apiResponses.SESSION_CREATED_SUCCESSFULLY,
                result: data
            });

        } catch (error) {
            throw error;
        }
    }

    static async update(sessionId, bodyData, userId) {
        bodyData.updatedAt = new Date().getTime();
        try {

            // console.log("")

            if (!await this.varifyMentor(userId)) {
                return common.failureResponse({
                    message: apiResponses.INVALID_PERMISSION,
                    statusCode: httpStatusCode.bad_request,
                    responseCode: 'CLIENT_ERROR'
                });
            }
            const result = await sessionData.updateOneSession({
                _id: ObjectId(sessionId)
            }, bodyData);
            if (result === 'SESSION_ALREADY_EXISTS') {
                return common.failureResponse({
                    message: apiResponses.SESSION_ALREADY_EXISTS,
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
                message: apiResponses.SESSION_UPDATED_SUCCESSFULLY
            });

        } catch (error) {
            throw error;
        }

    }

    static async details(sessionId) {
        try {
            const filter = {
                _id: sessionId
            }
            const sessionDetails = await sessionData.findOneSession(filter);
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
                result: sessionDetails ? sessionDetails : {}
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
            const sessionDetails = await sessionData.findAllSessions(loggedInUserId, page, limit, search, filters);
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
                result: sessionDetails ? sessionDetails : {}
            });

        } catch (error) {
            throw error;
        }
    }

    static enroll(sessionId, userId) {
        return new Promise(async (resolve, reject) => {
            try {
                const session = await sessionsData.findSessionById(sessionId);

                if (!session) {
                    return common.failureResponse({
                        message: apiResponses.SESSION_NOT_FOUND,
                        statusCode: httpStatusCode.bad_request,
                        responseCode: 'CLIENT_ERROR'
                    });
                }

                const attendee = {
                    sessionId: session,
                    enrolledOn: new Date(),
                    userId: userId
                }

                await sessionAttendes.create(attendee);

                return common.successResponse({
                    statusCode: httpStatusCode.created,
                    message: apiResponses.USER_ENROLLED_SUCCESSFULLY
                });
            } catch (error) {
                return reject(error);
            }
        })
    }

    static unEnroll(sessionId) {
        return new Promise(async (resolve, reject) => {
            try {
                /**
                 * Your business logic here
                 */
            } catch (error) {
                return reject(error);
            }
        })
    }

    static async varifyMentor(id) {
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
    static publishedSessions(page, limit, search) {
        return new Promise(async (resolve, reject) => {
            try {
                let publishedSessions =
                    await sessionsData.searchAndPagination(page, limit, search);

            } catch (error) {
                return reject(error);
            }
        })
    }

}