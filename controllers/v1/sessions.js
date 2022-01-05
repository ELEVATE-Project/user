/**
 * name : sessions.js
 * author : Aman
 * created-date : 07-Oct-2021
 * Description : Sessions.
 */

// Dependencies
const sessionsHelper = require("../../services/helper/sessions");

module.exports = class Sessions {

    /**
     * Update Sessions
     * @method
     * @name update
     * @param {Object} req -request data.
     * @param {String} [req.params.id] - Session id.
     * @param {String} req.headers.timezone - Session timezone.
     * @param {String} req.decodedToken._id - User Id.
     * @param {Object} req.body - requested body data.
     * @returns {JSON} - Create/update session.
    */

    async update(req) {
        try {
            if (req.params.id) {

                if (req.headers.timezone) {
                    req.body['timeZone'] = req.headers.timezone;
                }

                const sessionUpdated =
                    await sessionsHelper.update(
                        req.params.id,
                        req.body,
                        req.decodedToken._id,
                        req.method
                    );

                return sessionUpdated;
            } else {
                if (req.decodedToken.name) {
                    req.body.mentorName = req.decodedToken.name;
                }

                if (req.headers.timezone) {
                    req.body['timeZone'] = req.headers.timezone;
                }

                const sessionCreated =
                    await sessionsHelper.create(
                        req.body, req.decodedToken._id
                    );

                return sessionCreated;

            }
        } catch (error) {
            return error;
        }
    }

    /**
     * Sessions details
     * @method
     * @name details
     * @param {Object} req -request data.
     * @param {String} req.params.id - Session id.
     * @param {String} req.decodedToken._id - User Id.
     * @returns {JSON} - Session Details.
    */

    async details(req) {
        try {
            const sessionDetails =
                await sessionsHelper.details(
                    req.params.id,
                    req.decodedToken ? req.decodedToken._id : ""
                );
            return sessionDetails;
        } catch (error) {
            return error;
        }
    }

    /**
     * Sessions list
     * @method
     * @name list
     * @param {Object} req -request data.
     * @param {String} req.decodedToken._id - User Id.
     * @param {String} req.pageNo - Page No.
     * @param {String} req.pageSize - Page size limit.
     * @param {String} req.searchText - Search text.
     * @returns {JSON} - Session List.
    */

    async list(req) {
        try {
            const sessionDetails =
                await sessionsHelper.list(
                    req.decodedToken._id,
                    req.pageNo,
                    req.pageSize,
                    req.searchText,
                    req.query.status
                );
            return sessionDetails;
        } catch (error) {
            return error;
        }
    }

    /**
     * Share Session
     * @method
     * @name share
     * @param {Object} req -request data.
     * @param {String} req.params.id - Session Id.
     * @returns {JSON} - Share session.
    */

    async share(req) {
        try {
            const shareSessionDetails = await sessionsHelper.share(req.params.id);
            return shareSessionDetails;
        } catch (error) {
            return error;
        }
    }

    /**
     * Enroll Session
     * @method
     * @name share
     * @param {Object} req -request data.
     * @param {String} req.params.id - Session Id.
     * @param {Object} req.decodedToken - token information.
     * @param {String} req.headers.timeZone - timeZone.
     * @returns {JSON} - Enroll session.
    */

    async enroll(req) {
        try {
            const enrolledSession = await sessionsHelper.enroll(req.params.id, req.decodedToken, req.headers['timeZone']);
            return enrolledSession;
        } catch (error) {
            return error;
        }
    }

    /**
     * UnEnroll Session
     * @method
     * @name unEnroll
     * @param {Object} req -request data.
     * @param {String} req.params.id - Session Id.
     * @param {Object} req.decodedToken - token information.
     * @returns {JSON} - UnEnroll user session.
    */

    async unEnroll(req) {
        try {
            const unEnrolledSession = await sessionsHelper.unEnroll(req.params.id, req.decodedToken);
            return unEnrolledSession;
        } catch (error) {
            return error;
        }
    }

    /**
     * Start Session.
     * @method
     * @name start
     * @param {Object} req -request data.
     * @param {String} req.params.id - Session Id.
     * @param {Object} req.decodedToken - token information.
     * @returns {JSON} - Started Mentor session.
    */

    async start(req) {
        try {
            const sessionsStarted = await sessionsHelper.start(req.params.id, req.decodedToken.token);
            return sessionsStarted;
        } catch (error) {
            return error;
        }
    }

    /**
     * Completed Session.
     * @method
     * @name completed
     * @param {Object} req -request data.
     * @param {String} req.params.id - Session Id.
     * @returns {JSON} - Completed session callback url.
    */

    async completed(req) {
        try {
            const sessionsCompleted = await sessionsHelper.completed(req.params.id);
            return sessionsCompleted;
        } catch (error) {
            return error;
        }
    }

    /**
    * Get session recording.
    * @method
    * @name getRecording
    * @param {Object} req -request data.
    * @param {String} req.params.id - Session Id.
    * @returns {JSON} - Session recorded url.
   */

    async getRecording(req) {
        try {
            const recording = await sessionsHelper.getRecording(req.params.id);
            return resolve(recording);
        } catch (error) {
            return reject(error);
        }
    }

    /**
     * Session feedback.
     * @method
     * @name feedback
     * @param {Object} req -request data.
     * @param {String} req.params.id - Session Id.
     * @param {body} req.body - feedback body data.
     * @returns {JSON} - Session feedback information.
    */

    async feedback(req) {
        try {
            const sessionsFeedBack =
                await sessionsHelper.feedback(
                    req.params.id,
                    req.body
                );

            return resolve(sessionsFeedBack);
        } catch (error) {
            return reject(error);
        }
    }

    /**
     * Update recording link
     * @method
     * @name updateRecordingUrl
     * @param {Object} req -request data.
     * @param {String} req.params.id - internalMeetingId
     * @param {String} req.body.recordingUrl - Recording cloud storage url
     * @returns {JSON} - Recording url updated
    */

    async updateRecordingUrl(req) {
        const internalMeetingId = req.params.id;
        const recordingUrl = req.body.recordingUrl;
        try {
            const sessionUpdated = await sessionsHelper.updateRecordingUrl(internalMeetingId, recordingUrl);
            return sessionUpdated;
        } catch (error) {
            return error;
        }
    }
}