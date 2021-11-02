/**
 * name : models/users/query
 * author : Aman karki
 * Date : 07-Oct-2021
 * Description : Users database operations
 */

const Users = require("./model");

module.exports = class UsersData {
    
    static findOne(filter, projection = {}) {
        return new Promise(async (resolve,reject) => {
            try { 
                const userData = await Users.findOne(filter, projection);
                resolve(userData);
            } catch(error) {
                reject(error);
            }
        })
    }

    static createUser(data) {
        return new Promise(async (resolve, reject) => {
            try {
                await (new Users(data)).save();
                resolve(true)
            } catch (error) {
                reject(error);
            }
        });
    }

    static updateOneUser(filter, update, options = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                const res = await Users.updateOne(filter, update, options);
                if (res.ok === 1 && res.nModified === 1) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            } catch (error) {
                reject(error);
            }
        });
    }
}
