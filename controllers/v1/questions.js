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