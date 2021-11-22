const sessions = require('./sessions');

module.exports = class MenteesHelper {

    static async sessions(upComingSessions) {
        try {

            if (upComingSessions) {
                /** Upcoming sessions */
            } else {
                /** Enrolled sessions */
            }

            /**
             * Your business logic here
             */

        } catch (error) {
            return reject(error);
        }
    }

    static async reports(userId) {
        try {

            /**
             * Your business logic here
             */

        } catch (error) {
            return reject(error);
        }
    }

    static async homeFeed(userId) {
        try {
            let page = 1;
            let limit = 4;
            let allSessions = await sessions.upcomingPublishedSessions(page, limit);
            limit = 2;
            let mySessions = await this.getMySessions(userId);

        } catch (error) {
            return reject(error);
        }
    }
}