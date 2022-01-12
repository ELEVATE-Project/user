
const utilsHelper = require("../../generics/utils");
const httpStatusCode = require("../../generics/http-status");
const apiResponses = require("../../constants/api-responses");
const common = require('../../constants/common');
const questionsData = require("../../db/questions/queries");

module.exports = class questionsHelper {

    /**
     * Create questions.
     * @method
     * @name create
     * @param {Object} bodyData
     * @returns {JSON} - Create questions
    */

    static async create(bodyData) {
        try {
           let data = await questionsData.createQuestion(bodyData);
            return common.successResponse({ statusCode: httpStatusCode.created, message: apiResponses.QUESTION_CREATED_SUCCESSFULLY,result:data });
        } catch (error) {
            throw error;
        }
    }

     /**
     * Update questions.
     * @method
     * @name update
     * @param {String} questionId - question id.
     * @param {Object} bodyData
     * @returns {JSON} - Update questions.
    */

    static async update(questionId,bodyData) {
        try {
            const filter = { _id: questionId };
            const result = await questionsData.updateOneQuestion(filter, bodyData);
            if (result === 'QUESTION_ALREADY_EXISTS') {
                return common.failureResponse({ message: apiResponses.QUESTION_ALREADY_EXISTS, statusCode: httpStatusCode.bad_request, responseCode: 'CLIENT_ERROR' });
            } else if (result === 'QUESTION_NOT_FOUND') {
                return common.failureResponse({ message: apiResponses.QUESTION_NOT_FOUND, statusCode: httpStatusCode.bad_request, responseCode: 'CLIENT_ERROR' });
            }
            return common.successResponse({ statusCode: httpStatusCode.accepted, message: apiResponses.QUESTION_UPDATED_SUCCESSFULLY });
        } catch (error) {
            throw error;
        }
    }

     /**
     * Read question.
     * @method
     * @name read
     * @param {String} questionId - question id.
     * @returns {JSON} - Read question.
    */

    static async read(questionId) {
        try {
            const filter = { _id: questionId }
            const Questions = await questionsData.findOneQuestion(filter);
            if (!Questions) {
                return common.failureResponse({ message: apiResponses.QUESTION_NOT_FOUND, statusCode: httpStatusCode.bad_request, responseCode: 'CLIENT_ERROR' });
            }
            return common.successResponse({ statusCode: httpStatusCode.ok, message: apiResponses.QUESTION_FETCHED_SUCCESSFULLY, result: Questions ? Questions : {} });
        } catch (error) {
            throw error;
        }
    }
}