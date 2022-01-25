/**
 * name : sessions.js
 * author : Aman
 * created-date : 07-Oct-2021
 * Description : Sessions.
 */

// Dependencies
const sessionsHelper = require("../../services/helper/sessions");

module.exports = class Sessions {
    
    form() {
        return new Promise(async (resolve,reject) => {
            try {
                const sessionsForm = await sessionsHelper.form();
                return resolve(sessionsForm);
            } catch(error) {
                return reject(error);
            }
        })
    }

    update(req) {
        return new Promise(async (resolve,reject) => {
            try {
                const sessionUpdated = 
                await sessionsHelper.update(
                    req.params._id,
                    req.body
                );

                return resolve(sessionUpdated);
            } catch(error) {
                return reject(error);
            }
        })
    }

    details(req) {
        return new Promise(async (resolve,reject) => {
            try {
                const sessionDetails = 
                await sessionsHelper.details(
                    req.params._id
                );

                return resolve(sessionDetails);
            } catch(error) {
                return reject(error);
            }
        })
    }

    enroll(req) {
        return new Promise(async (resolve,reject) => {
            try {
                const enrolledSession = 
                await sessionsHelper.enroll(
                    req.params._id
                );

                return resolve(enrolledSession);
            } catch(error) {
                return reject(error);
            }
        })
    }
    
    unEnroll(req) {
        return new Promise(async (resolve,reject) => {
            try {
                const unEnrolledSession = 
                await sessionsHelper.unEnroll(
                    req.params._id
                );

                return resolve(unEnrolledSession);
            } catch(error) {
                return reject(error);
            }
        })
    }
}