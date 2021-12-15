/**
 * name : mentors.js
 * author : Aman
 * created-date : 12-Oct-2021
 * Description : Mentors.
 */

// Dependencies
const mentorsHelper = require("../../services/helper/mentors");

module.exports = class Mentors {

    async reports(req) {
        try {
            const reports = await mentorsHelper.reports(req.decodedToken._id, req.query.filterType);
            return reports;
        } catch (error) {
            return error;
        }
    }
}