const utilsHelper = require("../../generics/utils");
const httpStatusCode = require("../../generics/http-status");
const apiResponses = require("../../constants/api-responses");
const usersData = require("../../db/users/queries");

module.exports = class AccountHelper {
    
    static create(bodyData) {
        return new Promise(async (resolve,reject) => {
            try {

                if (!bodyData.email) {
                    return resolve({
                        status: httpStatusCode.bad_request,
                        message: apiResponses.EMAIL_REQUIRED
                    });
                }
        
                if (!utilsHelper.validEmail(bodyData.email)) {
                    return resolve({
                        status: httpStatusCode.bad_request,
                        message: apiResponses.EMAIL_INVALID
                    });
                }

                if (!bodyData.password) {
                    return resolve({
                        status: httpStatusCode.bad_request,
                        message: apiResponses.PASSWORD_REQUIRED
                    });
                }

                let user = await usersData.findUserByEmail(bodyData.email);

                if (user) {
                    return resolve({
                        status: httpStatusCode.bad_request,
                        message: apiResponses.USER_ALREADY_EXISTS
                    });
                }

            } catch(error) {
                return reject(error);
            }
        })
    } 

    static login(bodyData) {
        return new Promise(async (resolve,reject) => {
            try {
                 /**
                 * Your business logic here
                 */
            } catch(error) {
                return reject(error);
            }
        })
    } 

    static validateEmail(email) {
        let validation = {
            success: true
        }

        if (!email) {
            success = false;
            validation["message"] = apiResponses.EMAIL_REQUIRED;
            return validation;
        }

        if (!utilsHelper.validEmail(bodyData.email)) {
            success = false;
            validation["message"] = apiResponses.EMAIL_INVALID;
            return validation;
        }

        return validation;
    }

}