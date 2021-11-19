/**
 * name : sessions.js
 * author : Aman
 * created-date : 07-Oct-2021
 * Description : Sessions.
 */

// Dependencies
const sessionsHelper = require("../../services/helper/sessions");
const httpStatusCode = require("../../generics/http-status");

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

    /**
    * @api {post} /mentoring/v1/sessions/update/:id
    * @apiVersion 1.0.0
    * @apiName Update or Create Session
    * @apiGroup Sessions
    * @apiParamExample {json} Request-Body: 
    * {
    *   "description": "Training in leadership and skills improvement",
    *   "title": "Leader",
    *   "startDateTime": "2021-10-08 12:00:13"
    *   "endDateTime": "2021-10-08 12:30:13"
    * }
    * @apiSampleRequest /mentoring/v1/sessions/update/618270f757db5c85408af777
    * @apiParamExample {json} Response:
    * {
    *   "responseCode": 'OK',
    *   "message": "Session updated successfully",
    *   "result": []
    * }
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
    * session update or create
    * @method
    * @name update
    * @param {Object} req - request data.
    * @returns {JSON} - entities deletion response.
    */
    update(req) {
        return new Promise(async (resolve,reject) => {
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
                }else {

                   if(req.decodedToken.name){
                       req.body.mentorName = req.decodedToken.name;
                   }
                   
                   const sessionCreated = 
                    await sessionsHelper.create(
                        req.body,req.decodedToken._id
                    );

                    return resolve(sessionCreated);

                }
                
            } catch(error) {
                return reject(error);
            }
        })
    }

    /**
    * @api {get} /mentoring/v1/sessions/details/:id
    * @apiVersion 1.0.0
    * @apiName Get session details
    * @apiGroup Sessions
    * @apiParamExample {json} Request-Body: 
    * {}
    * @apiSampleRequest /mentoring/v1/sessions/details/61924cff584a8f8176fa435f
    * @apiParamExample {json} Response:
    * 
    * {
        "responseCode": "OK",
        "message": "Session fetched successfully",
        "result": {
            "recommendedFor": [
                {
                    "label": "HM",
                    "value": 1
                }
            ],
            "categories": [
                {
                    "label": "label",
                    "value": "value"
                }
            ],
            "medium": [
                {
                    "label": "Hindi",
                    "value": 2
                }
            ],
            "image": [
                {
                    "type": "png"
                }
            ],
            "_id": "61924cff584a8f8176fa435f",
            "title": "1",
            "description": "Training in leadership and skills improvement",
            "updatedAt": "2021-11-16T06:34:44.224Z",
            "createdAt": "2021-11-15T12:05:19.490Z",
            "__v": 0
        }
    }
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
    * session details
    * @method
    * @name details
    * @param {Object} req - request data.
    * @returns {JSON} - entities deletion response.
    */
    details(req) {
        return new Promise(async (resolve,reject) => {
            try {
                const sessionDetails = 
                await sessionsHelper.details(
                    req.params.id
                );
                return resolve(sessionDetails);
            } catch(error) {
                return reject(error);
            }
        })
    }

        /**
    * @api {get} /mentoring/v1/sessions/list
    * @apiVersion 1.0.0
    * @apiName Get list of sessions
    * @apiGroup Sessions
    * @apiParamExample {json} Request-Body: 
    * {}
    * @apiSampleRequest /mentoring/v1/sessions/list
    * @apiParamExample {json} Response:
    * 
    * {
        "responseCode": "OK",
        "message": "Sessions fetched successfully",
        "result":[{
            "recommendedFor": [
                {
                    "label": "HM",
                    "value": 1
                }
            ],
            "categories": [
                {
                    "label": "label",
                    "value": "value"
                }
            ],
            "medium": [
                {
                    "label": "Hindi",
                    "value": 2
                }
            ],
            "image": [
                {
                    "type": "png"
                }
            ],
            "_id": "61924cff584a8f8176fa435f",
            "title": "1",
            "description": "Training in leadership and skills improvement",
            "updatedAt": "2021-11-16T06:34:44.224Z",
            "createdAt": "2021-11-15T12:05:19.490Z",
            "__v": 0
        }]
    }
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
    * session list
    * @method
    * @name list
    * @param {Object} req - request data.
    * @returns {JSON} - entities deletion response.
    */
     list(req) {
        return new Promise(async (resolve,reject) => {
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
                    req.params._id,
                    req.decodedToken._id
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

    meetingCompleted(req) {
        return new Promise(async (resolve,reject) => {
            try {
                console.log("I am here");
                return resolve({
                    statusCode: httpStatusCode.ok,
                    message: "I am here"
                })
            } catch(error) {
                return reject(error);
            }
        })
    }
}