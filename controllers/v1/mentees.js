/**
 * name : mentees.js
 * author : Aman
 * created-date : 12-Oct-2021
 * Description : Mentees.
 */

// Dependencies
const menteesHelper = require("../../services/helper/mentees");

module.exports = class Mentors {

    async sessions(req) {
        try {
            const sessions = await menteesHelper.sessions(req.query.upComing ? true : false);
            return sessions;
        } catch (error) {
            return error;
        }
    }

    async reports(req) {
        try {
            const reports = await menteesHelper.reports(req.decodedToken._id);
            return reports;
        } catch (error) {
            return error;
        }
    }

    async homeFeed(req) {
        try {
            const homefeed = await menteesHelper.homeFeed(req.decodedToken._id);
            return homefeed;
        } catch (error) {
            return error;
        }
    }
}