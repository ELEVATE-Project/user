/**
 * name : middlewares/authenticator
 * author : Aman Kumar Gupta
 * Date : 04-Nov-2021
 * Description : Validating authorized requests
 */

const jwt = require('jsonwebtoken');

const httpStatusCode = require('../generics/http-status');
const apiResponses = require('../constants/api-responses');
const common = require('../constants/common');

module.exports = (req, res, next) => {

    if (!common.guestUrls.includes(req.url)) {
        const authHeader = req.get('X-auth-token');
        if (!authHeader) {
            throw common.failureResponse({ message: apiResponses.UNAUTHORIZED_REQUEST, statusCode: httpStatusCode.unauthorized, responseCode: 'UNAUTHORIZED' });
        }
        const authHeaderArray = authHeader.split(' ');
        if (authHeaderArray[0] !== 'bearer') {
            throw common.failureResponse({ message: apiResponses.UNAUTHORIZED_REQUEST, statusCode: httpStatusCode.unauthorized, responseCode: 'UNAUTHORIZED' });
        }
        try {
            decodedToken = jwt.verify(authHeaderArray[1], process.env.ACCESS_TOKEN_SECRET);
        } catch (err) {
            err.statusCode = httpStatusCode.unauthorized;
            err.responseCode = 'UNAUTHORIZED';
            err.message = apiResponses.ACCESS_TOKEN_EXPIRED;
            throw err;
        }

        if (!decodedToken) {
            throw common.failureResponse({ message: apiResponses.UNAUTHORIZED_REQUEST, statusCode: httpStatusCode.unauthorized, responseCode: 'UNAUTHORIZED' });
        }

        req.decodedToken = {
            _id: decodedToken.data._id,
            email: decodedToken.data.email,
            isAMentor: decodedToken.data.isAMentor
        };
    }
    next();
};