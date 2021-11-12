/**
 * name : mentors.js
 * author : Aman
 * created-date : 10-Nov-2021
 * Description : User mentors
 */

// Dependencies
const mentorsHelper = require("../../services/helper/mentors");

module.exports = class Mentors {

    /**
    * List of mentors
    * @method
    * @name list
    * @param {Object} req -request data.
    * @returns {Array} - Mentors 
    */

    async list(req) {
        try {
            const mentors = await mentorsHelper.list(req.pageNo,req.pageSize,req.searchText);
            return mentors;
        } catch (error) {
            return error;
        }
    }
}