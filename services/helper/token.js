const jwt = require('jsonwebtoken');

const httpStatusCode = require("../../generics/http-status");
const apiResponses = require("../../constants/api-responses");
const common = require('../../constants/common');
const utilsHelper = require("../../generics/utils");

module.exports = class TokenHelper {

    static generateToken(bodyData) {
        const refreshTokens = global.refreshTokens;

        /* Check valid user and it's valid refresh token */
        if (refreshTokens && refreshTokens[bodyData.email] && refreshTokens[bodyData.email] === bodyData.refreshToken) {
            let decodedToken;
            try {
                decodedToken = jwt.verify(bodyData.refreshToken, common.refreshTokenSecret);
            } catch (error) {
                /* If refresh token is expired */
                error.statusCode = httpStatusCode.unauthorized;
                error.message = apiResponses.REFRESH_TOKEN_EXPIRED;
                throw error;
            }

            if (!decodedToken) {
                return common.failureResponse({ message: apiResponses.UNAUTHORIZED_REQUEST, statusCode: httpStatusCode.unauthorized, responseCode: 'UNAUTHORIZED' });
            }

            /* Generate new access token */
            const accessToken = utilsHelper.generateToken({data: decodedToken.data}, process.env.ACCESS_TOKEN_SECRET, '1d');

            return common.successResponse({ statusCode: httpStatusCode.ok, message: apiResponses.ACCESS_TOKEN_GENERATED_SUCCESSFULLY, result: { access_token: accessToken } });
        }
        return common.failureResponse({ message: apiResponses.UNAUTHORIZED_REQUEST, statusCode: httpStatusCode.unauthorized, responseCode: 'UNAUTHORIZED' });
    }

}