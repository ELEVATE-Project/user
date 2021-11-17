const sessionsData = require("../../db/sessions/query");
const common = require('../../constants/common');
const sessionAttendes = require("../../db/sessionAttendes/query");

module.exports = class SessionsHelper {
    
    static form(bodyData) {
        return new Promise(async (resolve,reject) => {
            try {

                /**
                 * Sessions form business logic
                 */

            } catch(error) {
                return reject(error);
            }
        })
    } 

    static update(sessionId,bodyData) {
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

    static details(sessionId) {
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

    static enroll(sessionId,userId) {
        return new Promise(async (resolve,reject) => {
            try {
                const session = await sessionsData.findSessionById(sessionId);

                if (!session) {
                    return common.failureResponse({ message: apiResponses.SESSION_NOT_FOUND, statusCode: httpStatusCode.bad_request, responseCode: 'CLIENT_ERROR' });
                }

                const attendee = {
                    sessionId: session,
                    enrolledOn: new Date(),
                    userId: userId
                }

                await sessionAttendes.create(attendee);

                return common.successResponse({ statusCode: httpStatusCode.created, message: apiResponses.USER_ENROLLED_SUCCESSFULLY });
            } catch(error) {
                return reject(error);
            }
        })
    } 

    static unEnroll(sessionId) {
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
    
    static publishedSessions(page,limit,search) {
        return new Promise(async (resolve,reject) => {
            try {
                let publishedSessions = 
                await sessionsData.searchAndPagination(page,limit,search);
                
            } catch(error) {
                return reject(error);
            }
        })
    }
}