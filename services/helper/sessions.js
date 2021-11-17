const ObjectId = require('mongoose').Types.ObjectId;

const utilsHelper = require("../../generics/utils");
const httpStatusCode = require("../../generics/http-status");
const apiResponses = require("../../constants/api-responses");
const common = require('../../constants/common');
const sessionData = require("../../db/sessions/queries");

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

    static async update(sessionId, bodyData) {
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

    static enroll(sessionId) {
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
}