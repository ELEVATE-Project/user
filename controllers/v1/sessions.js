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
        return new Promise(async (resolve, reject) => {
            try {
                const sessionsForm = await sessionsHelper.form();
                return resolve(sessionsForm);
            } catch (error) {
                return reject(error);
            }
        })
    }
   
    update(req) {
        return new Promise(async (resolve, reject) => {
            try {

                if(req.params.id){
                    
                    const sessionUpdated = 
                    await sessionsHelper.update(
                        req.params.id,
                        req.body,
                        req.decodedToken._id,
                        req.method
                    );

                    return resolve(sessionUpdated);
                } else {

                    if (req.decodedToken.name) {
                        req.body.mentorName = req.decodedToken.name;
                    }

                    const sessionCreated =
                        await sessionsHelper.create(
                            req.body, req.decodedToken._id
                        );

                    return resolve(sessionCreated);

                }

            } catch (error) {
                return reject(error);
            }
        })
    }
   
    details(req) {
        return new Promise(async (resolve, reject) => {
            try {
                const sessionDetails =
                    await sessionsHelper.details(
                        req.params.id
                    );
                return resolve(sessionDetails);
            } catch (error) {
                return reject(error);
            }
        })
    }

    list(req) {
        return new Promise(async (resolve, reject) => {
            try {
                const sessionDetails =
                    await sessionsHelper.list(
                        req.decodedToken._id,
                        req.pageNo,
                        req.pageSize,
                        req.searchText,
                        req.query.status
                    );
                return resolve(sessionDetails);
            } catch (error) {
                return reject(error);
            }
        })
    }

    async share(req) {
        try {
            const shareSessionDetails = await sessionsHelper.share(req.params.id);
            return shareSessionDetails;
        } catch (error) {
            return error;
        }
    }

    async enroll(req) {
        try {
            const enrolledSession = await sessionsHelper.enroll(req.params.id, req.decodedToken._id);
            return enrolledSession;
        } catch (error) {
            return error;
        }
    }

    async unEnroll(req) {
        try {
            const unEnrolledSession = await sessionsHelper.unEnroll(req.params.id, req.decodedToken._id);
            return unEnrolledSession;
        } catch (error) {
            return error;
        }
    }

    start(req) {
        return new Promise(async (resolve,reject) => {
            try {
                const sessionsStarted = 
                await sessionsHelper.start(
                    req.params.id,
                    req.decodedToken.token
                );
                return resolve(sessionsStarted);
            } catch(error) {
                return reject(error);
            }  
        }) 
    }

    completed(req) {
        return new Promise(async (resolve,reject) => {
            try {
                const sessionsCompleted = 
                await sessionsHelper.completed(
                    req.params.id
                );
                
                return resolve(sessionsCompleted);
            } catch(error) {
                return reject(error);
            }  
        }) 
    }

    recordingStats(req) {
        return new Promise(async (resolve,reject) => {
            try {
                console.log(" -- I am in recordings --");
            } catch(error) {
                return reject(error);
            }  
        }) 
    }
}