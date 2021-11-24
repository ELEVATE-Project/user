const userBaseUrl = process.env.USER_SERIVCE_HOST + process.env.USER_SERIVCE_BASE_URL;
const requests = require("../../generics/requests");
const endpoints = require('../../constants/endpoints');

module.exports = class UserProfileHelper {

    static details(token) {
        return new Promise(async (resolve, reject) => {
            try {

                const profileUrl = userBaseUrl + endpoints.USER_PROFILE_DETAILS;
                const profileDetails = await requests.get(profileUrl,token);
                return resolve(profileDetails);
                
            } catch (error) {
                return reject(error);
            }
        })
    }

}