/**
 * name : models/sessions/queries
 * author : Aman karki
 * Date : 07-Oct-2021
 * Description : Sessions database operations
 */

const Sessions = require("./model");

module.exports = class SessionsData {

    static createSession(data) {
        return new Promise(async (resolve, reject) => {
            try {
               let response = await (new Sessions(data)).save();
                resolve(response)
            } catch (error) {
                console.log("err",error);
                reject(error);
            }
        });
    }
    static updateOneSession(filter, update, options = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                const updateResponse = await Sessions.updateOne(filter, update, options);
                if (updateResponse.n === 1 && updateResponse.nModified === 1) {
                    resolve('SESSION_UPDATED')
                } else if (updateResponse.n === 1 && updateResponse.nModified === 0) {
                    resolve('SESSION_ALREADY_EXISTS')
                } else {
                    resolve('SESSION_NOT_FOUND');
                }
            } catch (error) {
                reject(error);
            }
        });
    }
    static findOneSession(filter, projection = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                const sessionData = await Sessions.findOne(filter, projection);
                resolve(sessionData);
            } catch (error) {
                reject(error);
            }
        })
    }

}


