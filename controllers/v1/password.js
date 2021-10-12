/**
 * name : password.js
 * author : Aman
 * created-date : 12-Oct-2021
 * Description : User password.
 */

// Dependencies
const passwordHelper = require("../../services/helper/password");

module.exports = class Password {
    
    forget(req) {
        return new Promise(async (resolve,reject) => {
            try {
                const forgetPasswordData = await passwordHelper.forget(req.body);
                return resolve(forgetPasswordData);
            } catch(error) {
                return reject(error);
            }
        })
    }

    reset(req) {
        return new Promise(async (resolve,reject) => {
            try {
                const resetPasswordData = await passwordHelper.reset(req.params._id);
                return resolve(resetPasswordData);
            } catch(error) {
                return reject(error);
            }
        })
    }
}