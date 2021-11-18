const ObjectId = require('mongoose').Types.ObjectId;

const utilsHelper = require("../../generics/utils");
const httpStatusCode = require("../../generics/http-status");
const apiResponses = require("../../constants/api-responses");
const common = require('../../constants/common');
const sessionData = require("../../db/sessions/queries");
const sessionsData = require("../../db/sessions/query");
const common = require('../../constants/common');
const sessionAttendes = require("../../db/sessionAttendes/query");

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
        bodyData.createdBy = ObjectId(loggedInUserId);
        bodyData.updatedBy = ObjectId(loggedInUserId);
        try {
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

    static async update(sessionId, bodyData, loggedInUserId) {
        bodyData.updatedBy = ObjectId(loggedInUserId);
        bodyData.updatedAt = new Date().getTime();
        try {
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

    static async list(sessionId) {
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