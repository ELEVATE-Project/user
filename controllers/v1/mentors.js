/**
 * name : mentors.js
 * author : Aman
 * created-date : 12-Oct-2021
 * Description : Mentors.
 */

// Dependencies
const mentorsHelper = require("../../services/helper/mentors");

module.exports = class Mentors {
    
    sessions(req) {
        return new Promise(async (resolve,reject) => {
            try {
                const sessions = 
                await mentorsHelper.sessions(
                    req.query.upComing ? true : false
                );
                
                return resolve(sessions);
            } catch(error) {
                return reject(error);
            }
        })
    }

    reports(req) {
        return new Promise(async (resolve,reject) => {
            try {
                const reports = 
                await mentorsHelper.reports(
                    req.userInformation.userId // This need to get from token
                );
                
                return resolve(reports);
            } catch(error) {
                return reject(error);
            }
        })
    }
}