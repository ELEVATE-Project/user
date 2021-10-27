/**
 * name : token.js
 * author : Aman
 * created-date : 11-Oct-2021
 * Description : User token information.
 */

// Dependencies
const tokenHelper = require("../../services/helper/token");

module.exports = class Token {
    
    /**
    * @api {post} /user/v1/token/regenerate
    * @apiVersion 1.0.0
    * @apiName Regenerate access token
    * @apiGroup Token
    * @apiParamExample {json} Request-Body:
    * {
    *   "email" : "mentee@gmail.com",
    *   "refreshToken" : "asdxbebiuqeiu1273bahdxuy9813xbahjahDahiux7yiqhlaY74HDKA3y47yahdgcHDqcgkhggdfy",
    * }
    * @apiSampleRequest /user/api/v1/token/regenerate
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

    regenerate(req) {
        const params = req.body;
        try {
            const createdToken = tokenHelper.generateToken(params);
            return createdToken;
        } catch (error) {
            return error;
        }
    }
}