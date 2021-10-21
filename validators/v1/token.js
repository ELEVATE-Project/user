/**
 * name : validators/v1/token.js
 * author : Aman Gupta
 * Date : 21-Oct-2021
 * Description : Validations of accounts controller
*/

module.exports = {
    regenerate: (req) => {
        req.checkBody('email')
            .trim()
            .notEmpty()
            .withMessage('email field is empty')
            .isEmail()
            .withMessage('email is invalid')
            .normalizeEmail();

        req.checkBody('refreshToken')
            .notEmpty()
            .withMessage('refreshToken field is empty');
    }
};