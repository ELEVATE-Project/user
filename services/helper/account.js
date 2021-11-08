const bcryptJs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ObjectId = require('mongoose').Types.ObjectId;

const utilsHelper = require("../../generics/utils");
const httpStatusCode = require("../../generics/http-status");
const apiResponses = require("../../constants/api-responses");
const common = require('../../constants/common');
const usersData = require("../../db/users/queries");
const kafkaCommunication = require('../../generics/kafka-communication');

module.exports = class AccountHelper {

    static async create(bodyData) {
        try {
            const email = bodyData.email;
            const user = await usersData.findOne({ 'email.address': email });
            if (user) {
                return common.failureResponse({ message: apiResponses.USER_ALREADY_EXISTS, statusCode: httpStatusCode.not_acceptable, responseCode: 'CLIENT_ERROR' });
            }
            const salt = bcryptJs.genSaltSync(10);
            bodyData.password = bcryptJs.hashSync(bodyData.password, salt);
            bodyData.email = { address: email, verified: false };
            await usersData.createUser(bodyData);
            return common.successResponse({ statusCode: httpStatusCode.created, message: apiResponses.USER_CREATED_SUCCESSFULLY });
        } catch (error) {
            throw error;
        }
    }

    static async login(bodyData) {
        const projection = { refreshTokens: 0, otpInfo: 0 };
        try {
            let user = await usersData.findOne({ "email.address": bodyData.email }, projection);
            if (!user) {
                return common.failureResponse({ message: apiResponses.USER_DOESNOT_EXISTS, statusCode: httpStatusCode.bad_request, responseCode: 'CLIENT_ERROR' });
            }
            const isPasswordCorrect = bcryptJs.compareSync(bodyData.password, user.password);
            if (!isPasswordCorrect) {
                return common.failureResponse({ message: apiResponses.PASSWORD_INVALID, statusCode: httpStatusCode.bad_request, responseCode: 'CLIENT_ERROR' });
            }

            const tokenDetail = {
                data: {
                    _id: user._id,
                    email: user.email.address,
                    isAMentor: user.isAMentor
                }
            };

            const accessToken = utilsHelper.generateToken(tokenDetail, process.env.ACCESS_TOKEN_SECRET, '1d');
            const refreshToken = utilsHelper.generateToken(tokenDetail, process.env.REFRESH_TOKEN_SECRET, '183d');

            const update = {
                $push: {
                    refreshTokens: { token: refreshToken, exp: new Date().getTime() }
                },
                lastLoggedInAt: new Date().getTime()
            };
            await usersData.updateOneUser({ _id: ObjectId(user._id) }, update);

            /* Mongoose schema is in strict mode, so can not delete password directly */
            user = { ...user._doc };
            delete user.password;
            const result = { access_token: accessToken, refresh_token: refreshToken, user };

            return common.successResponse({ statusCode: httpStatusCode.ok, message: apiResponses.LOGGED_IN_SUCCESSFULLY, result });
        } catch (error) {
            throw error;
        }
    }

    static async logout(bodyData) {
        try {
            const user = await usersData.findOne({ _id: ObjectId(bodyData.loggedInId) });
            if (!user) {
                return common.failureResponse({ message: apiResponses.USER_DOESNOT_EXISTS, statusCode: httpStatusCode.bad_request, responseCode: 'CLIENT_ERROR' });
            }

            const update = {
                $pull: {
                    refreshTokens: { 'token': bodyData.refreshToken }
                }
            };
            /* Destroy refresh token for user */
            const res = await usersData.updateOneUser({ _id: ObjectId(user._id) }, update);

            /* If user doc not updated because of stored token does not matched with bodyData.refreshToken */
            if (!res) {
                return common.failureResponse({ message: apiResponses.INVALID_REFRESH_TOKEN, statusCode: httpStatusCode.unauthorized, responseCode: 'UNAUTHORIZED' });
            }

            return common.successResponse({ statusCode: httpStatusCode.ok, message: apiResponses.LOGGED_OUT_SUCCESSFULLY });
        } catch (error) {
            throw error;
        }
    }

    static async generateToken(bodyData) {

        let decodedToken;
        try {
            decodedToken = jwt.verify(bodyData.refreshToken, process.env.REFRESH_TOKEN_SECRET);
        } catch (error) {
            /* If refresh token is expired */
            error.statusCode = httpStatusCode.unauthorized;
            error.message = apiResponses.REFRESH_TOKEN_EXPIRED;
            throw error;
        }

        const user = await usersData.findOne({ _id: ObjectId(decodedToken.data._id) });

        /* Check valid user */
        if (!user) {
            return common.failureResponse({ message: apiResponses.USER_DOESNOT_EXISTS, statusCode: httpStatusCode.bad_request, responseCode: 'CLIENT_ERROR' });
        }

        /* Check valid refresh token stored in db */
        if (user.refreshTokens.length) {
            const token = user.refreshTokens.find(tokenData => tokenData.token === bodyData.refreshToken);
            if (!token) {
                return common.failureResponse({ message: apiResponses.REFRESH_TOKEN_NOT_FOUND, statusCode: httpStatusCode.internal_server_error, responseCode: 'CLIENT_ERROR' });
            }

            /* Generate new access token */
            const accessToken = utilsHelper.generateToken({ data: decodedToken.data }, process.env.ACCESS_TOKEN_SECRET, '1d');

            return common.successResponse({ statusCode: httpStatusCode.ok, message: apiResponses.ACCESS_TOKEN_GENERATED_SUCCESSFULLY, result: { access_token: accessToken } });
        }
        return common.failureResponse({ message: apiResponses.REFRESH_TOKEN_NOT_FOUND, statusCode: httpStatusCode.bad_request, responseCode: 'CLIENT_ERROR' });
    }

    static async generateOtp(bodyData) {
        try {
            let otp;
            let expiresIn
            let isValidOtpExist = true;
            const user = await usersData.findOne({ 'email.address': bodyData.email });
            if (!user) {
                return common.failureResponse({ message: apiResponses.USER_DOESNOT_EXISTS, statusCode: httpStatusCode.bad_request, responseCode: 'CLIENT_ERROR' });
            }

            if (!user.otpInfo.otp || new Date().getTime() > user.otpInfo.exp) {
                isValidOtpExist = false;
            } else {
                otp = user.otpInfo.otp // If valid then get previuosly generated otp
            }

            if (!isValidOtpExist) {
                otp = Math.floor(Math.random() * 900000 + 100000); // 6 digit otp
                expiresIn = new Date().getTime() + (24 * 60 * 60 * 1000); // 1 day expiration time
                await usersData.updateOneUser({ _id: user._id }, { otpInfo: { otp, exp: expiresIn } });
            }

            // Push otp to kafka
            const payload = {
                type: 'email',
                email: {
                    to: bodyData.email,
                    subject: 'Reset Password',
                    body: `Dear ${user.name}, Your OTP to reset your password is ${otp}. Please enter the OTP to reset your password. For your security, please do not share this OTP with anyone.`
                }
            };

            await kafkaCommunication.sendOtpEmailToKafka(payload);

            return common.successResponse({ statusCode: httpStatusCode.ok, message: apiResponses.OTP_SENT_SUCCESSFULLY });
        } catch (error) {
            throw error;
        }
    }

    static async resetPassword(bodyData) {
        try {
            const user = await usersData.findOne({ 'email.address': bodyData.email });
            if (!user) {
                return common.failureResponse({ message: apiResponses.USER_DOESNOT_EXISTS, statusCode: httpStatusCode.bad_request, responseCode: 'CLIENT_ERROR' });
            }

            if (user.otpInfo.otp != bodyData.otp || new Date().getTime() > user.otpInfo.exp) {
                return common.failureResponse({ message: apiResponses.OTP_INVALID, statusCode: httpStatusCode.bad_request, responseCode: 'CLIENT_ERROR' });
            }

            const salt = bcryptJs.genSaltSync(10);
            bodyData.password = bcryptJs.hashSync(bodyData.password, salt);
            await usersData.updateOneUser({ _id: user._id }, { password: bodyData.password });

            return common.successResponse({ statusCode: httpStatusCode.ok, message: apiResponses.PASSWORD_RESET_SUCCESSFULLY });
        } catch (error) {
            throw error;
        }
    }
}