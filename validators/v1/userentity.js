/**
 * name : validators/v1/entity.js
 * author : Aman Gupta
 * Date : 04-Nov-2021
 * Description : Validations of user entities controller
*/

module.exports = {
    create: (req) => {
        req.checkBody('code')
            .trim()
            .notEmpty()
            .withMessage('code field is empty')
            .matches(/^[A-Za-z]+$/)
            .withMessage('code is invalid, must not contain spaces');

        req.checkBody('name')
            .trim()
            .notEmpty()
            .withMessage('name field is empty')
            .matches(/^[A-Za-z0-9 ]+$/)
            .withMessage('name is invalid');

        req.checkBody('type')
            .trim()
            .notEmpty()
            .withMessage('type field is empty')
            .matches(/^[A-Za-z]+$/)
            .withMessage('type is invalid, must not contain spaces');
    },

    update: (req) => {

        req.checkParams('id')
            .notEmpty()
            .withMessage('id param is empty')
            .isMongoId()
            .withMessage('id is invalid');

        req.checkBody('code')
            .optional()
            .matches(/^[A-Za-z]+$/)
            .withMessage('code is invalid, must not contain spaces');

        req.checkBody('name')
            .optional()
            .matches(/^[A-Za-z0-9 ]+$/)
            .withMessage('name is invalid');

        req.checkBody('status')
            .optional()
            .matches(/^[A-Z]+$/)
            .withMessage('status is invalid, must be in all caps');

        req.checkBody('deleted')
            .optional()
            .isBoolean()
            .withMessage('deleted is invalid');

        req.checkBody('type')
            .optional()
            .matches(/^[A-Za-z]+$/)
            .withMessage('type is invalid, must not contain spaces');
    },

    read: (req) => {
        req.checkQuery('type')
            .trim()
            .notEmpty()
            .withMessage('type field is empty')
            .matches(/^[A-Za-z]+$/)
            .withMessage('type is invalid, must not contain spaces');

        req.checkQuery('deleted')
            .optional()
            .isBoolean()
            .withMessage('deleted is invalid');

        req.checkQuery('status')
            .optional()
            .trim()
            .matches(/^[A-Z]+$/)
            .withMessage('status is invalid, must be in all caps');
    },

    delete: (req) => {

        req.checkParams('id')
            .notEmpty()
            .withMessage('id param is empty')
            .isMongoId()
            .withMessage('id is invalid');
    },
};