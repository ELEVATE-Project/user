/**
 * name : models/sessionAttendes/queries
 * author : Aman karki
 * Date : 07-Oct-2021
 * Description : Session Attendes database operations
 */

const SessionAttendes = require("./model");

module.exports = class SessionsData {
    static create(data) {
        return new Promise(async (resolve, reject) => {
            try {
                await (new SessionAttendes(data)).save();
                resolve(true)
            } catch (error) {
                reject(error);
            }
        });
    }
}
