/**
 * name : models/sessionAttendees/queries
 * author : Aman karki
 * Date : 07-Oct-2021
 * Description : Session Attendes database operations
 */

const SessionAttendees = require("./model");

module.exports = class SessionsAttendeesData {

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

    static findOneSessionAttendee(sessionId, userId) {
        return new Promise(async (resolve, reject) => {
            try {
                const session = await SessionAttendees.findOne({ sessionId, userId, deleted: false }).lean();
                resolve(session);
            } catch (error) {
                reject(error);
            }
        })
    }
}
