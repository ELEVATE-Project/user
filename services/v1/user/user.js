/**
 * name : core-services/v1/user/user/UserService
 * author : Aman Kumar Gupta
 * Date : 30-Sep-2021
 * Description : User service containing core business logic
 */

const { successResponse, failureResponse } = require('../../../constants/common');
const httpStatus = require('../../../constants/http-status');
const apiResponses = require('../../../constants/api-responses');

module.exports = new class UserService {

    async register() {
        try {
            console.log('Register Service Triggered');
            /* Enable this to check error flow */
            // throw failureResponse({ message: 'Test Error Not Found', statusCode: httpStatus.bad_request });

            return successResponse(httpStatus.created, apiResponses.registeredSuccessfully);
        } catch (error) {
            return error;
        }
    }

    login() {
        
    }
};