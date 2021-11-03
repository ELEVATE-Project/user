module.exports = class SessionsHelper {
    
    static form(bodyData) {
        return new Promise(async (resolve,reject) => {
            try {

                /**
                 * Sessions form business logic
                 */

            } catch(error) {
                return reject(error);
            }
        })
    } 

    static update(sessionId,bodyData) {
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

    static details(sessionId) {
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

    static enroll(sessionId) {
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

    static unEnroll(sessionId) {
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