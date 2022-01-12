/**
 * name : questions.js
 * author : Aman Gupta
 * created-date : 04-Nov-2021
 * Description : Question Controller.
 */

// Dependencies
const feedbackHelper = require("../../services/helper/feedback");

module.exports = class Feedback {

    /**
     * Feedback forms API
     * @method
     * @name forms
     * @param {Object} req - request data.
     * @param {String} req.params.id - form id.
     * @param {String} req.decodedToken.isAMentor - User Mentor key.
     * @returns {JSON} - returns feedback forms data.
    */
    
    async forms(req) {
        try {
            const feedbackFormData = await feedbackHelper.forms(req.params.id,req.decodedToken.isAMentor);
            return feedbackFormData;
        } catch (error) {
            return error;
        }
    }
    
    /**
     * Feedback submit API
     * @method
     * @name submit
     * @param {Object} req - request data.
     * @param {String} req.params.id - form id.
     * @param {Object} req.body - Form submission data.
     * @param {String} req.decodedToken._id - User Id.
     * @param {String} req.decodedToken.isAMentor - User Mentor key.
     * @returns {JSON} - returns feedback submission data.
    */

    async submit(req) {
        try {
            const feedbackSubmitData = await feedbackHelper.submit(req.params.id,req.body,req.decodedToken._id,req.decodedToken.isAMentor);
            return feedbackSubmitData;
        } catch (error) {
            return error;
        }
    }
}