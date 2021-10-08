/**
 * name : account.js
 * author : Aman
 * created-date : 07-Oct-2021
 * Description : User Account.
 */

// Dependencies
const accountHelper = require("../../services/helper/account");

module.exports = class Account {
    
    create(req) {
        return new Promise(async (resolve,reject) => {
            try {
                const createdAccount = await accountHelper.create(req.body);
                return resolve(createdAccount);
            } catch(error) {
                return reject(error);
            }
        })
    }
}