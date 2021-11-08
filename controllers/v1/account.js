/**
 * name : account.js
 * author : Aman
 * created-date : 07-Oct-2021
 * Description : User Account.
 */

// Dependencies
const accountHelper = require("../../services/helper/account");

module.exports = class Account {

    /**
    * @api {post} /user/v1/account/create
    * @apiVersion 1.0.0
    * @apiName Creates User Account
    * @apiGroup Accounts
    * @apiParamExample {json} Request-Body:
    * {
    *   "name" : "mentee name",
    *   "email" : "mentee@gmail.com",
    *   "password" : "menteepass",
    * }
    * @apiSampleRequest /user/api/v1/account/create
    * @apiParamExample {json} Response:
    * {
    *   "responseCode": 'OK',
    *   "message": "User created successfully",
    *   "result": []
    * }
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
    * create mentee account
    * @method
    * @name create
    * @param {Object} req -request data.
    * @returns {JSON} - accounts creation.
    */

    async create(req) {
        const params = req.body;
        try {
            const createdAccount = await accountHelper.create(params);
            return createdAccount;
        } catch (error) {
            return error;
        }
    }

    /**
    * @api {post} /user/v1/account/login
    * @apiVersion 1.0.0
    * @apiName Login User Account
    * @apiGroup Accounts
    * @apiParamExample {json} Request-Body:
    * {
    *   "email" : "mentee@gmail.com",
    *   "password" : "menteepass",
    * }
    * @apiSampleRequest /user/api/v1/account/login
    * @apiParamExample {json} Response:
    * {
    *   "responseCode": 'OK',
    *   "message": "User logged in successfully",
    *   "result": {
    *       user: {
    *           "email": {
    *               "verified": false,
    *               "address": "aman@gmail.com"
    *           },
    *           "designation": [],
    *           "isAMentor": false,
    *           "hasAcceptedTAndC": false,
    *           "deleted": false,
    *           "_id": "61711e6c50cdf213e7971c2b",
    *           "name": "Aman",
    *           "areasOfExpertise": [],
    *           "updatedAt": "2021-10-21T08:01:48.203Z",
    *           "createdAt": "2021-10-21T08:01:48.203Z",
    *           "__v": 0,
    *       }
    *       "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7Il9pZCI6IjYxNzExZTZjNTBjZGYyMTNlNzk3MWMyYiIsImVtYWlsIjoiYW1hbkBnbWFpbC5jb20iLCJpc0FNZW50b3IiOmZhbHNlfSwiaWF0IjoxNjM0ODE1MjU5LCJleHAiOjE2MzQ5MDE2NTl9.jkiotUxYbOZkZ3PLkOj-PdPoEbWfEI0gMfPqyfgzB5w",
    *       "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7Il9pZCI6IjYxNzExZTZjNTBjZGYyMTNlNzk3MWMyYiIsImVtYWlsIjoiYW1hbkBnbWFpbC5jb20iLCJpc0FNZW50b3IiOmZhbHNlfSwiaWF0IjoxNjM0ODE1MjU5LCJleHAiOjE2NTA2MjY0NTl9.CjNSk6xPuHlPOcdTW9FflIlL9q-1MegE-GwpkBkbwZA"
    *   }
    * }
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
    * login user account
    * @method
    * @name login
    * @param {Object} req -request data.
    * @returns {JSON} - login details.
    */

    async login(req) {
        const params = req.body;
        try {
            const loggedInAccount = await accountHelper.login(params);
            return loggedInAccount;
        } catch (error) {
            return error;
        }
    }

    /**
    * @api {post} /user/v1/account/logout
    * @apiVersion 1.0.0
    * @apiName Logouts User Account
    * @apiGroup Accounts
    * @apiParamExample {json} Request-Body:
    * {
    *   "refreshToken" : "adbxqhdbhquwjHQWEXY182XIQH1823Yhgsd27y4bqhe72y4b..."
    * }
    * @apiSampleRequest /user/api/v1/account/logout
    * @apiParamExample {json} Response:
    * {
    *   "responseCode": 'OK',
    *   "message": "User logged out successfully",
    *   "result": []
    * }
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
    * logout user account
    * @method
    * @name create
    * @param {Object} req -request data.
    * @returns {JSON} - accounts loggedout.
    */

    async logout(req) {
        const params = req.body;
        params.loggedInId = req.decodedToken._id;
        try {
            const loggedOutAccount = await accountHelper.logout(params);
            return loggedOutAccount;
        } catch (error) {
            return error;
        }
    }

    /**
    * @api {post} /user/v1/account/generateToken
    * @apiVersion 1.0.0
    * @apiName Regenerate access token
    * @apiGroup Account
    * @apiParamExample {json} Request-Body:
    * {
    *   "refreshToken" : "asdxbebiuqeiu1273bahdxuy9813xbahjahDahiux7yiqhlaY74HDKA3y47yahdgcHDqcgkhggdfy",
    * }
    * @apiSampleRequest /user/v1/account/generateToken
    * @apiParamExample {json} Response:
    * {
    *   "responseCode": 'OK',
    *   "message": "Access token generated successfully",
    *   "result": {
    *       "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MTcxMWU2YzUwY2RmMjEzZTc5NzFjMmIiL"    
    *   }
    * }
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
    * regenerate access token
    * @method
    * @name regenerate
    * @param {Object} req -request data.
    * @returns {JSON} - access token info
    */

     async generateToken(req) {
        const params = req.body;
        try {
            const createdToken = await accountHelper.generateToken(params);
            return createdToken;
        } catch (error) {
            return error;
        }
    }

    /**
    * @api {post} /user/v1/account/generateOtp
    * @apiVersion 1.0.0
    * @apiName Generate otp 
    * @apiGroup Account
    * @apiParamExample {json} Request-Body:
    * {
    *   "email" : "testuser@gmail.com",
    * }
    * @apiSampleRequest /user/v1/account/generateOtp
    * @apiParamExample {json} Response:
    * {
    *   "responseCode": 'OK',
    *   "message": "Otp generated successfully",
    *   "result": []
    * }
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
    * generate otp
    * @method
    * @name generateOtp
    * @param {Object} req -request data.
    * @returns {JSON} - otp success response
    */

    async generateOtp(req) {
        const params = req.body;
        try {
            const result = await accountHelper.generateOtp(params);
            return result;
        } catch (error) {
            return error;
        }
    }

    /**
    * @api {post} /user/v1/account/resetPassword
    * @apiVersion 1.0.0
    * @apiName Reset user password
    * @apiGroup Account
    * @apiParamExample {json} Request-Body:
    * {
    *   "email" : "testuser@gmail.com",
    *   "password": "testpassword",
    *   "otp": "246813"
    * }
    * @apiSampleRequest /user/v1/account/resetPassword
    * @apiParamExample {json} Response:
    * {
    *   "responseCode": 'OK',
    *   "message": "Password updated successfully",
    *   "result": []
    * }
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
    * Reset password
    * @method
    * @name generateOtp
    * @param {Object} req -request data.
    * @returns {JSON} - password reset response
    */

    async resetPassword(req) {
        const params = req.body;
        try {
            const result = await accountHelper.resetPassword(params);
            return result;
        } catch (error) {
            return error;
        }
    }
}