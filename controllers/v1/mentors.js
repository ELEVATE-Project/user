/**
 * name : mentors.js
 * author : Aman
 * created-date : 12-Oct-2021
 * Description : Mentors.
 */

// Dependencies
const mentorsHelper = require("../../services/helper/mentors");

module.exports = class Mentors {

    async sessions(req) {
        try {
            const sessions = await mentorsHelper.sessions(req.query.upComing ? true : false);
            return sessions;
        } catch (error) {
            return error;
        }
    }

    async reports(req) {
        try {
            const reports = await mentorsHelper.reports(req.decodedToken._id, req.query.filterType);
            return reports;
        } catch (error) {
            return error;
        }
    }
}