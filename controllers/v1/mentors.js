/**
 * name : mentors.js
 * author : Aman
 * created-date : 12-Oct-2021
 * Description : Mentors.
 */

// Dependencies
const mentorsHelper = require("../../services/helper/mentors");

module.exports = class Profile {
    
    list(req) {
        return new Promise(async (resolve,reject) => {
            try {
                const listOfMentors = await mentorsHelper.list(req.body);
                return resolve(listOfMentors);
            } catch(error) {
                return reject(error);
            }
        })
    }
}