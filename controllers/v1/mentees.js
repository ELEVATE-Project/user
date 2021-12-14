/**
 * name : mentees.js
 * author : Aman
 * created-date : 12-Oct-2021
 * Description : Mentees.
 */

// Dependencies
const menteesHelper = require("../../services/helper/mentees");

module.exports = class Mentees {

    /**
    * mentees sessions
    * @method
    * @name sessions
    * @param {Object} req - request data.
    * @returns {JSON} - sessions
    */
    async sessions(req) {
        try {
            const sessions = await menteesHelper.sessions(req.decodedToken._id, req.query.enrolled, req.pageNo, req.pageSize, req.searchText);
            return sessions;
        } catch (error) {
            return error;
        }
    }

    async reports(req) {
        try {
            const reports = await menteesHelper.reports(req.decodedToken._id, req.query.filterType);
            return reports;
        } catch (error) {
            return error;
        }
    }

    async homeFeed(req) {
        try {
            const homefeed = await menteesHelper.homeFeed(req.decodedToken._id, req.decodedToken.isAMentor);
            return homefeed;
        } catch (error) {
            return error;
        }
    }

    async joinSession(req) {
        try {
            const session = await menteesHelper.joinSession(req.params.id, req.decodedToken.token);
            return session;
        } catch (error) {
            return error;
        }
    }
}