/**
 * name : models/users/query
 * author : Aman karki
 * Date : 07-Oct-2021
 * Description : Users database operations
 */

const Users = require("./model");

module.exports = class UsersData {
    
    static findUserByEmail(email, projection = {}) {
        return new Promise(async (resolve,reject) => {
            try { 
                const userData = await Users.findOne({"email.address": email}, projection);
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
}
