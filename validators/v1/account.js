/**
 * name : validators/v1/accounts.js
 * author : Aman Gupta
 * Date : 20-Oct-2021
 * Description : Validations of accounts controller
*/

module.exports = {
    create: (req) => {
        req.checkBody('name')
            .trim()
            .notEmpty()
            .withMessage('name field is empty')
            .matches(/^[A-Za-z ]+$/)
            .withMessage('name is invalid');

        req.checkBody('email')
            .trim()
            .notEmpty()
            .withMessage('email field is empty')
            .isEmail()
            .withMessage('email is invalid')
            .normalizeEmail();

        req.checkBody('password')
            .trim()
            .notEmpty()
            .withMessage('password field is empty');
    },

    login: (req) => {
        req.checkBody('email')
            .trim()
            .notEmpty()
            .withMessage('email field is empty')
            .isEmail()
            .withMessage('email is invalid')
            .normalizeEmail();

        req.checkBody('password')
            .trim()
            .notEmpty()
            .withMessage('password field is empty');
    },

    logout: (req) => {
        req.checkBody('refreshToken')
            .notEmpty()
            .withMessage('refreshToken field is empty');
    },

    generateToken: (req) => {
        req.checkBody('refreshToken')
            .notEmpty()
            .withMessage('refreshToken field is empty');
    }
};