/**
 * name : models/sessionAttendes/queries
 * author : Aman karki
 * Date : 07-Oct-2021
 * Description : Session Attendes database operations
 */

const SessionAttendees = require("./model");

module.exports = class SessionsAttendees {
    static create(data) {
        return new Promise(async (resolve, reject) => {
            try {
                await (new SessionAttendees(data)).save();
                resolve(true)
            } catch (error) {
                reject(error);
            }
        });
    }

    static findLinkBySessionAndUserId(id,sessionId) {
        return new Promise(async (resolve,reject) => {
            try { 
                const session = await SessionAttendees.findOne({userId:id,sessionId:sessionId,status: "enrolled",deleted:false}).lean();
                resolve(session);
            } catch(error) {
                reject(error);
            }
        })
    }

    static updateOne(filter, update) {
        return new Promise(async (resolve, reject) => {
            try {
                const updateResponse = await SessionAttendees.updateOne(filter, update);
                return resolve(updateResponse);
            } catch (error) {
                reject(error);
            }
        });
    }
}
