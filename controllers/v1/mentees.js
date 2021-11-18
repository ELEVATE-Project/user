/**
 * name : mentees.js
 * author : Aman
 * created-date : 12-Oct-2021
 * Description : Mentees.
 */

// Dependencies
const menteesHelper = require("../../services/helper/mentees");

module.exports = class Mentors {
    
    sessions(req) {
        return new Promise(async (resolve,reject) => {
            try {
                const sessions = 
                await menteesHelper.sessions(
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
                await menteesHelper.reports(
                    req.userInformation.userId // This need to get from token
                );
                
                return resolve(reports);
            } catch(error) {
                return reject(error);
            }
        })
    }

    homefeed(req) {
        return new Promise(async (resolve,reject) => {
            try {
                const homefeed = 
                await menteesHelper.homefeed(
                    req.userInformation.userId
                );
                
                return resolve(homefeed);
            } catch(error) {
                return reject(error);
            }
        })
    }
}