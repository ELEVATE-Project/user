/**
 * name : questions.js
 * author : Aman Gupta
 * created-date : 04-Nov-2021
 * Description : Question Controller.
 */

// Dependencies
const questionsHelper = require("../../services/helper/questions");

module.exports = class Questions {

    /**
    * @api {post} /mentoring/v1/questions/create
    * @apiVersion 1.0.0
    * @apiName Creates Questions
    * @apiGroup Questions
    * @apiParamExample {json} Request-Body:
    *{
        "question": [
            "How much you rate the audio/video quality of session1",
            "Hindi question"
        ],
        "options": [],
        "deleted": false,
        "responseType": "radio",
        "value": "",
        "hint": ""
    }
    * @apiSampleRequest /mentoring/v1/questions/create
    * @apiParamExample {json} Response:
    {
        "responseCode": "OK",
        "message": "Question created successfully",
        "result": {
            "question": [
                "How much you rate the audio/video quality of session1",
                "Hindi question"
            ],
            "options": [],
            "deleted": false,
            "responseType": [
                "radio"
            ],
            "_id": "61a61e3483f163a4384724c0",
            "value": "",
            "hint": "",
            "updatedAt": "2021-11-30T12:51:00.920Z",
            "createdAt": "2021-11-30T12:51:00.920Z",
            "__v": 0
        }
    }
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
    * create questions
    * @method
    * @name create
    * @param {Object} req -request data.
    * @returns {JSON} - Question creation object.
    */

    async create(req) {
        try {
            const createdQuestion = await questionsHelper.create(req.body);
            return createdQuestion;
        } catch (error) {
            return error;
        }
    }

    /**
    * @api {post} /mentoring/v1/Question/update
    * @apiVersion 1.0.0
    * @apiName Updates Question
    * @apiGroup Questions
    * @apiParamExample {json} Request-Body:
    {
        "question": [
            "How much you rate the audio/video quality of session1",
            "Hindi question"
        ],
        "options": [],
        "deleted": false,
        "responseType": "radio",
        "value": "",
        "hint": ""
    }
    * @apiSampleRequest /mentoring/v1/question/update
    * @apiParamExample {json} Response:
    {
        "responseCode": "OK",
        "message": "Question updated successfully",
        "result": []
    }
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
    * updates question 
    * @method
    * @name update
    * @param {Object} req - request data.
    * @returns {JSON} - Question updation response.
    */

    async update(req) {
        try {
            const updatedQuestion = await questionsHelper.update(req.params.id,req.body);
            return updatedQuestion;
        } catch (error) {
            return error;
        }
    }

    /**
    * @api {post} /mentoring/v1/questions/read/:questionId
    * @apiVersion 1.0.0
    * @apiName Read Question
    * @apiGroup Questions
    * @apiParamExample {json} Request-Body:
    * { } 
    * @apiSampleRequest /mentoring/v1/questions/read
    * @apiParamExample {json} Response:
    {
        "responseCode": "OK",
        "message": "Question fetched successfully",
        "result": {
            "question": [
                "How much you rate the audio/video quality of session1",
                "Hindi question"
            ],
            "options": [],
            "deleted": false,
            "responseType": [
                "radio"
            ],
            "_id": "61a61c97f2755ea2869c4d4a",
            "value": "",
            "hint": "",
            "updatedAt": "2021-11-30T12:44:07.292Z",
            "createdAt": "2021-11-30T12:44:07.292Z",
            "__v": 0
        }
    }
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
    * reads question
    * @method
    * @name read
    * @param {Object} req -request data.
    * @returns {JSON} - question object.
    */

    async read(req) {

        try {
            const questionData = await questionsHelper.read(req.params.id);
            return questionData;
        } catch (error) {
            return error;
        }
    }
}