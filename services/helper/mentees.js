module.exports = class MenteesHelper {
    
    static sessions(upComingSessions) {
        return new Promise(async (resolve,reject) => {
            try {

                if (upComingSessions) {
                    /** Upcoming sessions */
                } else {
                    /** Enrolled sessions */
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