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

    static reports(userId) {
        return new Promise(async (resolve,reject) => {
            try {

                /**
                 * Your business logic here
                 */

            } catch(error) {
                return reject(error);
            }
        })
    }
}