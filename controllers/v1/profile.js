/**
 * name : password.js
 * author : Aman
 * created-date : 12-Oct-2021
 * Description : User password.
 */

// Dependencies
const profileHelper = require("../../services/helper/profile");

module.exports = class Profile {
    
    update(req) {
        return new Promise(async (resolve,reject) => {
            try {
                const profileData = await profileHelper.update(req.body);
                return resolve(profileData);
            } catch(error) {
                return reject(error);
            }
        })
    }

    form() {
        return new Promise(async (resolve,reject) => {
            try {
                const profileForm = await profileHelper.form();
                return resolve(profileForm);
            } catch(error) {
                return reject(error);
            }
        })
    }

    details(req) {
        return new Promise(async (resolve,reject) => {
            try {
                const profileDetails = await profileHelper.details(req.params._id);
                return resolve(profileDetails);
            } catch(error) {
                return reject(error);
            }
        })
    }
}