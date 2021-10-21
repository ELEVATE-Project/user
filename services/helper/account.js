const bcryptJs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const utilsHelper = require("../../generics/utils");
const httpStatusCode = require("../../generics/http-status");
const apiResponses = require("../../constants/api-responses");
const common = require('../../constants/common');
const usersData = require("../../db/users/queries");

global.refreshTokens = {};

module.exports = class AccountHelper {

    static async create(bodyData) {
        try {
            const email = bodyData.email;
            const user = await usersData.findUserByEmail(email);
            if (user) {
                return common.failureResponse({ message: apiResponses.USER_ALREADY_EXISTS, statusCode: httpStatusCode.not_acceptable });
            }
            const salt = bcryptJs.genSaltSync(10);
            bodyData.password = bcryptJs.hashSync(bodyData.password, salt);
            bodyData.email = { address: email, verified: false };
            await usersData.createUser(bodyData);
            return common.successResponse({ statusCode: httpStatusCode.created, message: apiResponses.USER_CREATED_SUCCESSFULLY});
        } catch (error) {
            throw error;
        }
    }

    static async login(bodyData) {
        try {
            const user = await usersData.findUserByEmail(bodyData.email);
            if (!user) {
                return common.failureResponse({ message: apiResponses.USER_DOESNOT_EXISTS, statusCode: httpStatusCode.bad_request });
            }
            const isPasswordCorrect = bcryptJs.compareSync(bodyData.password, user.password);
            if (!isPasswordCorrect) {
                return common.failureResponse({ message: apiResponses.PASSWORD_INVALID, statusCode: httpStatusCode.bad_request });
            }

            const tokenDetail = {
                data: {
                    _id: user._id,
                    email: user.email.address,
                    isAMentor: user.isAMentor
                }
            };

            const accessToken = jwt.sign(tokenDetail, common.accessTokenSecret, { expiresIn: '1d' });
            const refreshToken = jwt.sign(tokenDetail, common.refreshTokenSecret, { expiresIn: '183d' });
            global.refreshTokens[user.email.address] = refreshToken;

            return common.successResponse({ statusCode: httpStatusCode.ok, message: apiResponses.LOGGED_IN_SUCCESSFULLY, accessToken, refreshToken, data: user });
        } catch (error) {
            throw error;
        }
    }

    static async logout(bodyData) {
        try {
            const user = await usersData.findUserByEmail(bodyData.email);
            if (!user) {
                return common.failureResponse({ message: apiResponses.USER_DOESNOT_EXISTS, statusCode: httpStatusCode.bad_request });
            }
            delete global.refreshTokens[bodyData.email];
            return common.successResponse({ statusCode: httpStatusCode.ok, message: apiResponses.LOGGED_OUT_SUCCESSFULLY });
        } catch (error) {
            throw error;
        }
    }
}