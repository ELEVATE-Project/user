const sessionsData = require('../../db/sessions/queries');

const utils = require('../../generics/utils');
const common = require('../../constants/common');
const apiResponses = require("../../constants/api-responses");
const httpStatusCode = require("../../generics/http-status");

module.exports = class MentorsHelper {
    
    static sessions(upComingSessions) {
        return new Promise(async (resolve,reject) => {
            try {

                if (upComingSessions) {
                    /** Upcoming sessions */
                } else {
                    /** Completed sessions */
                }

                /**
                 * Your business logic here
                 */

            } catch(error) {
                return reject(error);
            }
        })
    }

    static async reports(userId, filterType) {
        let filterStartDate;
        let filterEndDate;
        let totalSessionCreated;
        let totalsessionHosted;
        let filters;
        try {
            if (filterType === 'MONTHLY') {
                [filterStartDate, filterEndDate] = utils.getCurrentMonthRange();
            } else if (filterType === 'WEEKLY') {
                [filterStartDate, filterEndDate] = utils.getCurrentWeekRange();
            } else if (filterType === 'QUARTERLY') {
                [filterStartDate, filterEndDate] = utils.getCurrentQuarterRange();
            }

            /* totalSessionCreated */ 
            filters = {
                createdAt: {
                    $gte: filterStartDate.toISOString(),
                    $lte: filterEndDate.toISOString()
                },
                userId,
                deleted: false
            };

            totalSessionCreated = await sessionsData.countSessions(filters);

            /* totalsessionHosted */ 
            filters = {
                startDateUtc: {
                    $gte: filterStartDate.toISOString(),
                    $lte: filterEndDate.toISOString()
                },
                userId,
                status: 'completed',
                deleted: false
            };
          
            totalsessionHosted = await sessionsData.countSessions(filters);
            return common.successResponse({statusCode: httpStatusCode.ok, message: apiResponses.MENTORS_REPORT_FETCHED_SUCCESSFULLY, result: {totalSessionCreated, totalsessionHosted}});

        } catch (error) {
            throw error;
        }
    }
}