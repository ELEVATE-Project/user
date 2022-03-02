/**
 * name : questionsSet.js
 * author : Rakesh Kumar
 * created-date : 01-Dec-2021
 * Description : Question Controller.
 */

// Dependencies
const questionsSetHelper = require("../../services/helper/questionsSet");

module.exports = class QuestionsSet {

    /**
    * create questions set
    * @method
    * @name create
    * @param {Object} req -request data.
    * @returns {JSON} - Questions Set creation.
    */

    async create(req) {
        try {
            const createQuestionsSet = await questionsSetHelper.create(req.body);
            return createQuestionsSet;
        } catch (error) {
            return error;
        }
    }

     /**
    * update questions set
    * @method
    * @name update
    * @param {Object} req -request data.
    * @param {String} req.params.id - question set id.
    * @returns {JSON} - Questions Set updation.
    */

    async update(req) {
        try {
            const updateQuestionsSet = await questionsSetHelper.update(req.params.id,req.body);
            return updateQuestionsSet;
        } catch (error) {
            return error;
        }
    }
    
     /**
    * read questions set
    * @method
    * @name read
    * @param {Object} req -request data.
    * @param {String} req.params.id - question set id.
    * @returns {JSON} - Questions set data.
    */

    async read(req) {

        try {
            const questionsSetData = await questionsSetHelper.read(req.params.id);
            return questionsSetData;
        } catch (error) {
            return error;
        }
    }
}