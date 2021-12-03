const utilsHelper = require("../../generics/utils");
const httpStatusCode = require("../../generics/http-status");
const apiResponses = require("../../constants/api-responses");
const common = require('../../constants/common');
const questionsSetData = require("../../db/questionsSet/queries");
const questionData = require("../../db/questions/queries");

module.exports = class questionsSetHelper {

    static async create(bodyData) {
        try {

            let questionInfo = await questionData.find({
                _id: {
                    $in: bodyData.questions
                },
                "questionsSetId": {
                    $exists: false
                }
            });

            if (questionInfo.length ==0 || (bodyData.questions.length != questionInfo.length )) {
                return common.failureResponse({
                    message: apiResponses.QUESTION_ALREADY_BEEN_USED,
                    statusCode: httpStatusCode.bad_request,
                    responseCode: 'CLIENT_ERROR'
                });
            }

            let data = await questionsSetData.createQuestionsSet(bodyData);
            if (data) {
                await questionData.updateData({
                    _id: {
                        $in: bodyData.questions
                    }
                }, {
                    "questionsSetId": data._id
                });
            }

            return common.successResponse({
                statusCode: httpStatusCode.created,
                message: apiResponses.QUESTIONS_SET_CREATED_SUCCESSFULLY,
                result: data
            });
        } catch (error) {
            throw error;
        }
    }

    static async update(questionSetId, bodyData) {
        try {
            
            
            if(bodyData.questions) {
                let update = true;
                let questionInfo = await questionData.find({
                    _id: {
                        $in: bodyData.questions
                    }
                });
               
                if(questionInfo && questionInfo.length != bodyData.questions.length){
                    return common.failureResponse({
                        message: apiResponses.QUESTION_NOT_FOUND,
                        statusCode: httpStatusCode.bad_request,
                        responseCode: 'CLIENT_ERROR'
                    });
                }

                await Promise.all(questionInfo.map(async function(question) {
                    if (question.questionsSetId && question.questionsSetId != questionSetId) {
                        update = false;
                    }
                }));

                if (update == false) {
                    return common.failureResponse({
                        message: apiResponses.QUESTION_ALREADY_BEEN_USED,
                        statusCode: httpStatusCode.bad_request,
                        responseCode: 'CLIENT_ERROR'
                    });
                }
            }

         

            const filter = {
                _id: questionId
            };
            const result = await questionsSetData.updateOneQuestionsSet(filter, bodyData);

            if(bodyData.questions){

                // await questionData.updateData(
                //    {
                //     "questionsSetId": questionSetId
                // } ,{ questionsSetId: "" });

                await questionData.updateData({
                    _id: {
                        $in: bodyData.questions
                    }
                }, {
                    "questionsSetId": questionSetId
                });
            }


            if (result === 'QUESTIONS_SET_ALREADY_EXISTS') {
                return common.failureResponse({
                    message: apiResponses.QUESTIONS_SET_ALREADY_EXISTS,
                    statusCode: httpStatusCode.bad_request,
                    responseCode: 'CLIENT_ERROR'
                });
            } else if (result === 'QUESTIONS_SET_NOT_FOUND') {
                return common.failureResponse({
                    message: apiResponses.QUESTIONS_SET_NOT_FOUND,
                    statusCode: httpStatusCode.bad_request,
                    responseCode: 'CLIENT_ERROR'
                });
            }
            return common.successResponse({
                statusCode: httpStatusCode.accepted,
                message: apiResponses.QUESTIONS_SET_UPDATED_SUCCESSFULLY
            });
        } catch (error) {
            throw error;
        }
    }

    static async read(questionsSetId) {
        try {
            const filter = {
                _id: questionsSetId
            }
            const QuestionsSet = await questionsSetData.findOneQuestionsSet(filter);
            if (!QuestionsSet) {
                return common.failureResponse({
                    message: apiResponses.QUESTION_NOT_FOUND,
                    statusCode: httpStatusCode.bad_request,
                    responseCode: 'CLIENT_ERROR'
                });
            }
            return common.successResponse({
                statusCode: httpStatusCode.ok,
                message: apiResponses.QUESTIONS_SET_FETCHED_SUCCESSFULLY,
                result: QuestionsSet ? QuestionsSet : {}
            });
        } catch (error) {
            throw error;
        }
    }
}