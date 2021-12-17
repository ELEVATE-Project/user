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
    * @param {String} req.decodedToken._id - User Id.
    * @param {Boolean} req.query.enrolled - Enrolled key true/false.
    * @param {Number} req.pageNo - page no.
    * @param {Number} req.pageSize - page size limit.
    * @param {String} req.searchText - search text.
    * @returns {JSON} - List of mentees sessions. Include all and my sessions.
    */

    async sessions(req) {
        try {
            const sessions = await menteesHelper.sessions(req.decodedToken._id, req.query.enrolled, req.pageNo, req.pageSize, req.searchText);
            return sessions;
        } catch (error) {
            return error;
        }
    }

    /**
     * Mentees reports
     * @method
     * @name reports
     * @param {Object} req - request data.
     * @param {String} req.decodedToken._id - User Id.
     * @param {String} req.query.filterType - filterType.
     * @param {String} [req.query.filterType = "MONTHLY"] - Monthly reports.
     * @param {String} [req.query.filterType = "WEEKLY"] - Weekly report.
     * @param {String} [req.query.filterType = "QUARTERLY"] - Quarterly report.
     * @returns {JSON} - Mentees reports.
    */

    async reports(req) {
        try {
            const reports = await menteesHelper.reports(req.decodedToken._id, req.query.filterType);
            return reports;
        } catch (error) {
            return error;
        }
    }

    /**
     * Mentees homefeed API.
     * @method
     * @name homeFeed
     * @param {Object} req - request data.
     * @param {String} req.decodedToken._id - User Id.
     * @param {Boolean} req.decodedToken.isAMentor - true/false.
     * @returns {JSON} - Mentees homefeed response.
    */

    async homeFeed(req) {
        try {
            const homefeed = await menteesHelper.homeFeed(req.decodedToken._id, req.decodedToken.isAMentor);
            return homefeed;
        } catch (error) {
            return error;
        }
    }

    /**
     * Join Mentees session.
     * @method
     * @name joinSession
     * @param {Object} req - request data.
     * @param {String} req.params.id - Session id.
     * @param {String} req.decodedToken.token - Mentees token.
     * @returns {JSON} - Mentees join session link.
    */

    async joinSession(req) {
        try {
            const session = await menteesHelper.joinSession(req.params.id, req.decodedToken.token);
            return session;
        } catch (error) {
            return error;
        }
    }
}