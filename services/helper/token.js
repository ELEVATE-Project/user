const jwt = require('jsonwebtoken');

const httpStatusCode = require("../../generics/http-status");
const apiResponses = require("../../constants/api-responses");
const common = require('../../constants/common');

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
                return common.failureResponse({ message: apiResponses.UNAUTHORIZED_REQUEST, statusCode: httpStatusCode.unauthorized });
            }

            /* Generate new access token */
            const accessToken = jwt.sign(decodedToken.data, common.accessTokenSecret, { expiresIn: '1d' });
            return common.successResponse({ statusCode: httpStatusCode.ok, message: apiResponses.ACCESS_TOKEN_GENERATED_SUCCESSFULLY, accessToken });
        }
        return common.failureResponse({ message: apiResponses.UNAUTHORIZED_REQUEST, statusCode: httpStatusCode.unauthorized });
    }

}