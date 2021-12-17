// Dependencies
const sessionAttendees = require("../../db/sessionAttendees/queries");
const sessionData = require("../../db/sessions/queries");
const common = require('../../constants/common');
const apiResponses = require("../../constants/api-responses");
const httpStatusCode = require("../../generics/http-status");
const questionsSetData = require("../../db/questionsSet/queries");
const questionsData = require("../../db/questions/queries");


module.exports = class MenteesHelper {

    /**
     * Pending feedback.
     * @method
     * @name pending
     * @param {String} userId - user id.
     * @param {Boolean} isAMentor
     * @returns {JSON} - pending feedback.
    */

    static async pending(userId, isAMentor) {
        try {

            let sessions = [];

            if (isAMentor) {
                let filters = {
                    status: 'completed',
                    skippedFeedback: false,
                    feedbacks: {
                        $size: 0
                    },
                    userId: userId
                };
                let mentorSessions = await sessionData.findSessions(filters, {
                    _id: 1,
                    title: 1,
                    description: 1
                });
                sessions = mentorSessions;
            }

            let sessionAttendeesFilter = {
                'sessionDetail.status': 'completed',
                skippedFeedback: false,
                feedbacks: {
                    $size: 0
                },
                userId: userId
            };
            let menteeSessionAttendence = await sessionAttendees.findPendingFeedbackSessions(sessionAttendeesFilter);

            if (menteeSessionAttendence && menteeSessionAttendence.length > 0) {
                menteeSessionAttendence.forEach(sessionData => {
                    if (sessionData.sessionDetail) {

                        let found = sessions.find(session => (session._id).toString() === (sessionData.sessionDetail._id).toString())
                        if (!found) {
                            sessions.push(sessionData.sessionDetail);
                        }
                    }

                })
            }

            return common.successResponse({
                statusCode: httpStatusCode.ok,
                message: apiResponses.PENDING_FEEDBACK_FETCHED_SUCCESSFULLY,
                result: sessions
            });

        } catch (error) {
            throw error;
        }
    }

     /**
     * Feedback forms.
     * @method
     * @name forms
     * @param {String} sessionId - session id.
     * @param {Boolean} isAMentor
     * @returns {JSON} - Feedback forms.
    */

    static async forms(sessionId, isAMentor) {

        try {
            let sessioninfo = await sessionData.findOneSession({
                _id: sessionId
            }, {
                mentorFeedbackForm: 1,
                menteeFeedbackForm: 1
            });
            if (!sessioninfo) {
                return common.failureResponse({
                    message: apiResponses.SESSION_NOT_FOUND,
                    statusCode: httpStatusCode.bad_request,
                    responseCode: 'CLIENT_ERROR'
                });
            }

            let formCode;
            if (isAMentor) {
                formCode = sessioninfo.mentorFeedbackForm;
            } else {
                formCode = sessioninfo.menteeFeedbackForm;
            }

            let questionsSet = await questionsSetData.findOneQuestionsSet({
                code: formCode
            })

            let result = {};
            if (questionsSet && questionsSet.questions) {

                let questions = await questionsData.find({
                    _id: {
                        $in: questionsSet.questions
                    }
                });

                if (questions && questions.length > 0) {
                    questions.map(data => {
                        if (data.question) {
                            data['label'] = data.question;
                            delete data.question;
                            return data;
                        }
                    });
                    result = {
                        form: questions
                    }
                }
            }

            return common.successResponse({
                statusCode: httpStatusCode.ok,
                message: apiResponses.FEEDBACKFORM_MESSAGE,
                result: result
            });

        } catch (error) {
            throw error;
        }
    }

      /**
     * Feedback submission.
     * @method
     * @name submit
     * @param {String} sessionId - session id.
     * @param {Object} updateData
     * @param {String} userId - user id.
     * @param {Boolean} isAMentor
     * @returns {JSON} - Feedback submission.
    */

    static async submit(sessionId, updateData, userId, isAMentor) {
        try {

            let sessionInfo = await sessionData.findOneSession({
                _id: sessionId
            }, {
                _id: 1,
                skippedFeedback: 1,
                feedbacks: 1
            });
            if (!sessionInfo) {
                return common.failureResponse({
                    message: apiResponses.SESSION_NOT_FOUND,
                    statusCode: httpStatusCode.bad_request,
                    responseCode: 'CLIENT_ERROR'
                });
            }

            if (isAMentor) {

                if (sessionInfo.skippedFeedback == true || (sessionInfo.feedbacks && sessionInfo.feedbacks.length > 0)) {

                    return common.failureResponse({
                        message: apiResponses.FEEDBACK_ALREADY_SUBMITTED,
                        statusCode: httpStatusCode.bad_request,
                        responseCode: 'CLIENT_ERROR'
                    });
                }

                const result = await sessionData.updateOneSession({
                    _id: sessionId,
                    userId: userId
                }, updateData);

                if (result == "SESSION_NOT_FOUND") {
                    return common.failureResponse({
                        message: apiResponses.SESSION_NOT_FOUND,
                        statusCode: httpStatusCode.bad_request,
                        responseCode: 'CLIENT_ERROR'
                    });
                } else {
                    return common.successResponse({
                        statusCode: httpStatusCode.ok,
                        message: apiResponses.FEEDBACK_SUBMITTED
                    });
                }

            } else {

                let sessionAttendesInfo = await sessionAttendees.findOneSessionAttendee(sessionId, userId);
                if (sessionAttendesInfo.skippedFeedback == true || (sessionAttendesInfo.feedbacks && sessionAttendesInfo.feedbacks.length > 0)) {

                    return common.failureResponse({
                        message: apiResponses.FEEDBACK_ALREADY_SUBMITTED,
                        statusCode: httpStatusCode.bad_request,
                        responseCode: 'CLIENT_ERROR'
                    });
                }

                const result = await sessionAttendees.updateOne({
                    sessionId: sessionId,
                    userId: userId
                }, updateData);

                if (result == "SESSION_ATTENDENCE_NOT_FOUND") {
                    return common.failureResponse({
                        message: apiResponses.SESSION_NOT_FOUND,
                        statusCode: httpStatusCode.bad_request,
                        responseCode: 'CLIENT_ERROR'
                    });
                } else {

                    return common.successResponse({
                        statusCode: httpStatusCode.ok,
                        message: apiResponses.FEEDBACK_SUBMITTED
                    });
                }

            }


        } catch (error) {
            throw error;
        }
    }

}