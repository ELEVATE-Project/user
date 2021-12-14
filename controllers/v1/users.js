/**
 * name : feedback.js
 * author : Rakesh Kumar
 * created-date : 02-Dec-2021
 * Description : Users Controller.
 */

// Dependencies
const feedbackHelper = require("../../services/helper/feedback");

module.exports = class Users {


    async pendingFeedbacks(req) {
        try {

            const pendingFeedBacks = await feedbackHelper.pending(req.decodedToken._id,req.decodedToken.isAMentor);
            return pendingFeedBacks;
        } catch (error) {
            return error;
        }
    }

}