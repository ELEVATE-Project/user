/**
 * name : models/users/query
 * author : Aman karki
 * Date : 07-Oct-2021
 * Description : Users database operations
 */

const Users = require("./model");

module.exports = class UsersData {
    
    static findUserByEmail(email) {
        return new Promise(async (resolve,reject) => {
            try { 
                let userData = await Users.findOne({"email.address": email});
                return resolve(userData);
            } catch(error) {
                console.log(error);
            }
        })
    }
}
