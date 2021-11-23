/**
 * name : validators/v1/mentees.js
 * author : Aman Gupta
 * Date : 19-Nov-2021
 * Description : Validations of mentees controller
 */

module.exports = {

    sessions: (req) => {
        req.checkQuery('enrolled')
            .notEmpty()
            .withMessage('enrolled query is empty')
            .isBoolean()
            .withMessage('enrolled is invalid')
            .toBoolean();
    },

    homefeed: (req) => {

    }
};