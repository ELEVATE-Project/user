/**
 * name : questions.js
 * author : Aman Gupta
 * created-date : 04-Nov-2021
 * Description : Question Controller.
 */

// Dependencies
const feedbackHelper = require("../../services/helper/feedback");

module.exports = class Questions {


    
    async forms(req) {
        try {
            const feedbackFormData = await feedbackHelper.forms(req.params.id,req.decodedToken.isAMentor);
            return feedbackFormData;
        } catch (error) {
            return error;
        }
    }
    
    async submit(req) {
        try {
            const feedbackSubmitData = await feedbackHelper.submit(req.params.id,req.body,req.decodedToken._id,req.decodedToken.isAMentor);
            return feedbackSubmitData;
        } catch (error) {
            return error;
        }
    }
}