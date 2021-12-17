// Dependencies
const userBaseUrl = process.env.USER_SERIVCE_HOST + process.env.USER_SERIVCE_BASE_URL;
const requests = require("../../generics/requests");
const endpoints = require('../../constants/endpoints');

module.exports = class UserProfileHelper {

      /**
     * User profile details.
     * @method
     * @name details
     * @param {String} [token =  ""] - token information.
     * @param {String} [userId =  ""] - user id.
     * @returns {JSON} - User profile details.
    */

    static details(token="",userId="") {
        return new Promise(async (resolve, reject) => {
            try {

                let profileUrl = userBaseUrl + endpoints.USER_PROFILE_DETAILS;

                let internalToken =false;
                if(userId!=""){
                    profileUrl = profileUrl + "/"+userId;
                    internalToken =true;
                }
                const profileDetails = await requests.get(profileUrl,token,internalToken);
                return resolve(profileDetails);
                
            } catch (error) {
                return reject(error);
            }
        })
    }

}