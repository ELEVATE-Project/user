/**
 * name : mentors.js
 * author : Aman
 * created-date : 12-Oct-2021
 * Description : Mentors.
 */

// Dependencies
const mentorsHelper = require("../../services/helper/mentors");

module.exports = class Mentors {

     /**
     * Mentors reports
     * @method
     * @name reports
     * @param {Object} req - request data.
     * @param {String} req.decodedToken._id - User Id.
     * @param {String} req.query.filterType - filterType.
     * @param {String} [req.query.filterType = "MONTHLY"] - Monthly reports.
     * @param {String} [req.query.filterType = "WEEKLY"] - Weekly report.
     * @param {String} [req.query.filterType = "QUARTERLY"] - Quarterly report.
     * @returns {JSON} - Mentors reports.
    */

    async reports(req) {
        try {
            const reports = await mentorsHelper.reports(req.decodedToken._id, req.query.filterType);
            return reports;
        } catch (error) {
            return error;
        }
    }
}