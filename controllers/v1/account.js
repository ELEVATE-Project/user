/**
 * name : account.js
 * author : Aman
 * created-date : 07-Oct-2021
 * Description : User Account.
 */

// Dependencies
const accountHelper = require("../../services/helper/account");
const csv = require("csvtojson");

module.exports = class Account {

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

    /**
    * Bulk create mentors
    * @method
    * @name bulkCreateMentors
    * @param {Object} req -request data.
    * @returns {CSV} - created mentors.
    */

     async bulkCreateMentors(req) {
        try {
            const mentors = await csv().fromString(req.files.mentors.data.toString());
            const createdMentors = await accountHelper.bulkCreateMentors(mentors,req.decodedToken);
            return createdMentors;
        } catch (error) {
            return error;
        }
    }

    /**
    * Reset password
    * @method
    * @name verifyMentor
    * @param {Object} req -request data.
    * @returns {JSON} - verifies user is mentor or not
    */
   

         async verifyMentor(req) {
            try {
                const result = await accountHelper.verifyMentor(req.query.userId);
                return result;
            } catch (error) {
                return error;
            }
        }
   
    async acceptTermsAndCondition(req) {
        try {
            const result = await accountHelper.acceptTermsAndCondition(req.decodedToken._id);
            return result;
        } catch (error) {
            return error;
        }
    }
}